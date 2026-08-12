Exit code: 0
Wall time: 2.9 seconds
Output:
CREATE TABLE `tags` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`name` text NOT NULL,`slug` text NOT NULL,`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tags_slug` ON `tags` (`slug`);
--> statement-breakpoint
CREATE TABLE `post_tags` (`post_id` integer NOT NULL,`tag_id` integer NOT NULL,PRIMARY KEY(`post_id`,`tag_id`),FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade,FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade);
--> statement-breakpoint
CREATE INDEX `idx_post_tags_tag_id` ON `post_tags` (`tag_id`);
--> statement-breakpoint
CREATE TABLE `media` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`name` text NOT NULL,`key` text NOT NULL,`url` text NOT NULL,`alt` text DEFAULT '' NOT NULL,`mime_type` text NOT NULL,`size` integer DEFAULT 0 NOT NULL,`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_media_key` ON `media` (`key`);
--> statement-breakpoint
CREATE TABLE `admin_users` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`user_id` text NOT NULL,`email` text NOT NULL,`display_name` text NOT NULL,`role` text DEFAULT 'author' NOT NULL,`status` text DEFAULT 'active' NOT NULL,`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_users_user_id` ON `admin_users` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_users_email` ON `admin_users` (`email`);
--> statement-breakpoint
CREATE TABLE `seo_settings` (`id` integer PRIMARY KEY NOT NULL,`site_title` text NOT NULL,`description` text NOT NULL,`canonical_url` text DEFAULT '' NOT NULL,`og_image` text DEFAULT '' NOT NULL,`robots` text DEFAULT 'index,follow' NOT NULL,`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL);
--> statement-breakpoint
CREATE TABLE `analytics_daily` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`date` text NOT NULL,`views` integer DEFAULT 0 NOT NULL,`visitors` integer DEFAULT 0 NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_analytics_daily_date` ON `analytics_daily` (`date`);
--> statement-breakpoint
PRAGMA optimize;

