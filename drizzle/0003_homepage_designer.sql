Exit code: 0
Wall time: 2.6 seconds
Output:
CREATE TABLE IF NOT EXISTS `homepage_settings` (
  `id` integer PRIMARY KEY NOT NULL,
  `config` text NOT NULL,
  `updated_at` text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

