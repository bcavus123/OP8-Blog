import { getDb, getPool } from "../db";
import { contentActivities } from "../db/schema";

export async function ensureContentActivityTable() {
  await getPool().query(`CREATE TABLE IF NOT EXISTS content_activities (
    id INT AUTO_INCREMENT PRIMARY KEY, post_id INT NULL, post_title VARCHAR(255) NOT NULL,
    action VARCHAR(32) NOT NULL, description VARCHAR(500) NOT NULL, actor_email VARCHAR(190) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content_activity_post(post_id), INDEX idx_content_activity_created(created_at),
    INDEX idx_content_activity_action(action), FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE SET NULL)`);
}

export async function recordContentActivity(input: { postId: number | null; postTitle: string; action: string; description: string; actorEmail: string }) {
  await ensureContentActivityTable();
  await getDb().insert(contentActivities).values({
    postId: input.postId, postTitle: input.postTitle.slice(0, 255), action: input.action.slice(0, 32),
    description: input.description.slice(0, 500), actorEmail: input.actorEmail.slice(0, 190),
  });
}
