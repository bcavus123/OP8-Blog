CREATE TABLE IF NOT EXISTS `research_items` (
 `id` int AUTO_INCREMENT PRIMARY KEY,
 `title` varchar(255) NOT NULL,
 `author` varchar(190) NOT NULL,
 `type` varchar(50) NOT NULL DEFAULT 'Report',
 `engine` varchar(80) NOT NULL DEFAULT 'Value Creation',
 `source` varchar(190) NOT NULL,
 `source_url` text NOT NULL,
 `publication_year` int NOT NULL,
 `status` varchar(32) NOT NULL DEFAULT 'review',
 `favorite` int NOT NULL DEFAULT 0,
 `citation_count` int NOT NULL DEFAULT 0,
 `notes` text NOT NULL,
 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX `idx_research_status` (`status`),
 INDEX `idx_research_engine` (`engine`),
 INDEX `idx_research_year` (`publication_year`)
);
