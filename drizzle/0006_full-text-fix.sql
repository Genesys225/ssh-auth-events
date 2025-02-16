CREATE VIRTUAL TABLE ssh_events_fts USING fts5(
  username,
  ip_address,
  hostname,
  content='ssh_events',
  content_rowid='id'
);