CREATE TABLE `content_migration` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`values_json` text DEFAULT '{}' NOT NULL,
	`previous_json` text,
	`updated_at` text DEFAULT '' NOT NULL
);
