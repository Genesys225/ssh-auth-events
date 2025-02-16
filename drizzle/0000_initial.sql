CREATE TABLE `ssh_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`event_type` text NOT NULL,
	`username` text NOT NULL,
	`ip_address` text NOT NULL,
	`status` text NOT NULL,
	`raw_message` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_ssh_events_timestamp` ON `ssh_events` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_ssh_events_username` ON `ssh_events` (`username`);--> statement-breakpoint
CREATE INDEX `idx_ssh_events_ip` ON `ssh_events` (`ip_address`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`require_password_change` integer DEFAULT true NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`last_login` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);