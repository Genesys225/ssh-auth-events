#!/bin/sh
# scripts/detect-and-start.sh

apt-get update
apt-get install -y systemd-journal-reader

CONFIG_PATH="/etc/vector/vector.yaml"
mkdir -p "$(dirname "$CONFIG_PATH")"

# Check for systemd journal
if [ -d "/var/log/journal" ]; then
    cat > "$CONFIG_PATH" << 'EOF'
data_dir: /var/lib/vector

sources:
  system_logs:
    type: "journald"
    journal_directory: "/var/log/journal"
    include_units: ["ssh.service", "sshd.service"]
    # Removed current_boot_only so the entire journal history is read

transforms:
  ssh_events:
    type: "remap"
    inputs: ["system_logs"]
    source: |
      identifier = to_string(.SYSLOG_IDENTIFIER) ?? ""
      message = to_string(.message) ?? ""
      if !contains(identifier, "sshd") {
        . = null
      } else {
        # Use the native timestamp if available; fall back to now()
        .ts = if exists(.timestamp) {
          format_timestamp!(.timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ")
        } else {
          now()
        }
        .hostname = to_string(.host) ?? "unknown"
        .content = message
        
        if contains(message, "Accepted password") {
          events = parse_regex(message, r'Accepted password for (?P<username>[^\s]+) from (?P<ip_address>[^\s]+)') ?? null
          if events != null {
            .event_type = "login"
            .status = "success"
            .username = events.username
            .ip_address = events.ip_address
            .auth_method = "password"
          } else {
            . = null
          }
        } else if contains(message, "Failed password") {
          events = parse_regex(message, r'Failed password for (?:invalid user )?(?P<username>[^\s]+) from (?P<ip_address>[^\s]+)') ?? null
          if events != null {
            .event_type = "login"
            .status = "failed"
            .username = events.username
            .ip_address = events.ip_address
            .auth_method = "password"
          } else {
            . = null
          }
        } else if contains(message, "session opened for user") {
          # Drop all session_open events from journald
          . = null
        } else {
          . = null
        }
      }

EOF

# If no journald, check for traditional log files
elif [ -f "/var/log/auth.log" ]; then
    LOG_FILE="/var/log/auth.log"
elif [ -f "/var/log/secure" ]; then
    LOG_FILE="/var/log/secure"
else
    echo "No supported log source found!"
    exit 1
fi

# Generate file-based config if needed
if [ ! -z "$LOG_FILE" ]; then
    cat > "$CONFIG_PATH" << EOF
data_dir: /var/lib/vector

sources:
  system_logs:
    type: "file"
    include:
      - "${LOG_FILE}"
    # Always read the file from the beginning on startup
    start_at_beginning: true
    multiline:
      mode: "halt_before"
      start_pattern: '^(?:\d{4}-\d{2}-\d{2}T|\w{3}\s+\d{1,2}\s)'
      condition_pattern: '^(?:\d{4}-\d{2}-\d{2}T|\w{3}\s+\d{1,2}\s)'
      timeout_ms: 1000
    encoding:
      codec: utf-8

transforms:
  ssh_events:
    type: "remap"
    inputs: ["system_logs"]
    source: |
      . = parse_regex!(.message, r'^(?P<ts>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+[+-]\d{2}:\d{2})\s+(?P<hostname>[^\s]+)\s+(?P<process>[^\[:]+)(?:\[\d+\])?:\s+(?P<content>.*)$')
      if exists(.ts) {
        .ts = parse_timestamp!(.ts, format: "%Y %b %d %H:%M:%S")
      } else {
        .ts = now()
      }
      if !contains(.process, "sshd") {
        . = null
      }
      if contains(.content, "Accepted") {
        events = parse_regex!(.content, r'Accepted (?P<method>password|publickey) for (?P<username>[^\s]+) from (?P<ip_address>[^\s]+)(?: port \d+)?')
        if events != null {
          .event_type = "login"
          .status = "success"
          .username = events.username
          .source_user = "sshd"
          .ip_address = events.ip_address
          .auth_method = events.method
        } else {
          . = null
        }
      } else if contains(.content, "Failed password") {
        events = parse_regex!(.content, r'Failed password for (?:invalid user )?(?P<username>[^\s]+) from (?P<ip_address>[^\s]+)(?: port \d+)?')
        if events != null {
          .event_type = "login"
          .status = "failed"
          .username = events.username
          .source_user = "sshd"
          .ip_address = events.ip_address
          .auth_method = "password"
        } else {
          . = null
        }
      } else if contains(.content, "Disconnected from user") {
        events = parse_regex!(.content, r'Disconnected from user (?P<username>[^\s]+)')
        if events != null {
          .event_type = "logout"
          .status = "success"
          .username = events.username
          .source_user = "sshd"
          .ip_address = "unknown"
          .auth_method = "unknown"
        } else {
          . = null
        }
      } else {
        . = null
      }
EOF
fi

# Add common sink configuration
cat >> "$CONFIG_PATH" << 'EOF'

sinks:
  sqlite_sink:
    type: "http"
    inputs: ["ssh_events"]
    uri: "http://app:3000/api/log-events"
    encoding:
      codec: "json"
    method: "post"
    request:
      headers:
        "Content-Type": "application/json"
      retry_max_retries: 5
      retry_initial_backoff_secs: 1
      timeout_secs: 60
    healthcheck:
      enabled: true
EOF

# Start Vector with the generated config
echo "Starting Vector with detected configuration..."
exec vector --config "$CONFIG_PATH"
