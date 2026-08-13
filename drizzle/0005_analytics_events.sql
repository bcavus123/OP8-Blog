CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` bigint AUTO_INCREMENT NOT NULL,
  `event_type` varchar(32) NOT NULL DEFAULT 'pageview',
  `visitor_id` varchar(64) NOT NULL,
  `session_id` varchar(64) NOT NULL,
  `path` varchar(512) NOT NULL,
  `referrer` text NOT NULL,
  `channel` varchar(32) NOT NULL DEFAULT 'direct',
  `device` varchar(24) NOT NULL DEFAULT 'desktop',
  `country` varchar(80) NOT NULL DEFAULT 'Bilinmiyor',
  `duration_seconds` int NOT NULL DEFAULT 0,
  `post_id` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`),
  CONSTRAINT `fk_analytics_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL
);
CREATE INDEX `idx_analytics_created` ON `analytics_events` (`created_at`);
CREATE INDEX `idx_analytics_path_created` ON `analytics_events` (`path`,`created_at`);
CREATE INDEX `idx_analytics_visitor_created` ON `analytics_events` (`visitor_id`,`created_at`);
CREATE INDEX `idx_analytics_post_created` ON `analytics_events` (`post_id`,`created_at`);
