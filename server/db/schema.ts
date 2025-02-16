import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  requirePasswordChange: integer('require_password_change', { mode: 'boolean' }).notNull().default(true),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sshEvents = sqliteTable('ssh_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  eventType: text('event_type').notNull(), // login, logout
  username: text('username').notNull(),
  hostname: text('hostname'),
  ipAddress: text('ip_address').notNull(),
  status: text('status').notNull(), // success, failed
  authMethod: text('auth_method'), // password, publickey, unknown
  rawMessage: text('raw_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  timestampIdx: index('idx_ssh_events_timestamp').on(table.timestamp),
  usernameIdx: index('idx_ssh_events_username').on(table.username),
  hostnameIdx: index('idx_ssh_events_hostname').on(table.hostname),
  rawMessageIdx: index('idx_ssh_events_rawMessage').on(table.rawMessage),
  ipAddressIdx: index('idx_ssh_events_ip').on(table.ipAddress),
  uniqueEvent: uniqueIndex('uniq_ssh_events').on(
    table.timestamp,
    table.username,
    table.hostname,
    table.eventType,
    table.ipAddress
  ),
}));