CREATE TABLE IF NOT EXISTS content_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NULL,
  post_title VARCHAR(255) NOT NULL,
  action VARCHAR(32) NOT NULL,
  description VARCHAR(500) NOT NULL,
  actor_email VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_content_activity_post(post_id),
  INDEX idx_content_activity_created(created_at),
  INDEX idx_content_activity_action(action),
  CONSTRAINT fk_content_activity_post FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE SET NULL
);
