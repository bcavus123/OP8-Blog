ALTER TABLE `posts` ADD `excerpt` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `content` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `cover_url` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `cover_alt` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `seo_title` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `seo_description` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `published_at` text;
--> statement-breakpoint
ALTER TABLE `posts` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
--> statement-breakpoint
ALTER TABLE `posts` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
--> statement-breakpoint
CREATE INDEX `idx_posts_status_published_at` ON `posts` (`status`,`published_at`);
--> statement-breakpoint
PRAGMA optimize;
