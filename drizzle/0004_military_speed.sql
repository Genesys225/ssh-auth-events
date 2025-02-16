DROP INDEX `uniq_ssh_events`;--> statement-breakpoint
ALTER TABLE `ssh_events` ADD `hostname` text;--> statement-breakpoint
CREATE INDEX `idx_ssh_events_hostname` ON `ssh_events` (`hostname`);--> statement-breakpoint
CREATE INDEX `idx_ssh_events_rawMessage` ON `ssh_events` (`raw_message`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_ssh_events` ON `ssh_events` (`timestamp`,`username`,`hostname`,`event_type`,`ip_address`);