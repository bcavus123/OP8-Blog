import { asc, eq } from "drizzle-orm";
import { getDb, getPool } from "../db";
import { categories, contentOpportunities, frameworkAreas, posts, tags } from "../db/schema";

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
const futureDate = (index: number) => {
  const date = new Date();
  date.setDate(date.getDate() + 7 + index * 7);
  date.setHours(10, 0, 0, 0);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

export async function ensureOpportunityTable() {
  await getPool().query(`CREATE TABLE IF NOT EXISTS content_opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY, source_key VARCHAR(190) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL, description TEXT NOT NULL, engine VARCHAR(64) NOT NULL,
    framework_area_id INT NULL, category_id INT NULL, content_type VARCHAR(50) NOT NULL DEFAULT 'article',
    priority VARCHAR(24) NOT NULL DEFAULT 'medium', focus_keyword VARCHAR(190) NOT NULL,
    suggested_publish_at TIMESTAMP NULL, status VARCHAR(24) NOT NULL DEFAULT 'suggested', post_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content_opportunity_status(status), INDEX idx_content_opportunity_engine(engine),
    INDEX idx_content_opportunity_priority(priority),
    FOREIGN KEY(framework_area_id) REFERENCES framework_areas(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE SET NULL)`);
}

export async function refreshContentOpportunities() {
  await ensureOpportunityTable();
  const db = getDb();
  const [areas, categoryRows, postRows, tagRows] = await Promise.all([
    db.select().from(frameworkAreas).orderBy(asc(frameworkAreas.engine), asc(frameworkAreas.coverage)),
    db.select().from(categories),
    db.select({ id: posts.id, title: posts.title, excerpt: posts.excerpt, status: posts.status, categoryId: posts.categoryId }).from(posts),
    db.select({ name: tags.name }).from(tags),
  ]);
  const activeStatuses = new Set(["idea", "draft", "review", "approved", "scheduled", "published"]);
  const activePosts = postRows.filter((post) => activeStatuses.has(post.status));
  const tagNames = tagRows.map((tag) => normalize(tag.name));

  const candidates = areas.map((area) => {
    const engineKey = normalize(area.engine), areaKey = normalize(area.name);
    const category = categoryRows.find((item) => normalize(item.name).includes(engineKey) || engineKey.includes(normalize(item.name)));
    const enginePosts = activePosts.filter((post) => {
      const categoryName = categoryRows.find((item) => item.id === post.categoryId)?.name || "";
      return normalize(categoryName).includes(engineKey) || `${normalize(post.title)} ${normalize(post.excerpt)}`.includes(engineKey);
    });
    const duplicate = activePosts.some((post) => {
      const text = `${normalize(post.title)} ${normalize(post.excerpt)}`;
      return text.includes(areaKey) || areaKey.includes(normalize(post.title));
    });
    const keywordMissing = !tagNames.some((tag) => tag.includes(areaKey) || areaKey.includes(tag));
    const score = (area.contentNeed ? 45 : 0) + Math.max(0, 80 - area.coverage) + Math.max(0, 3 - enginePosts.length) * 15 + (keywordMissing ? 10 : 0);
    return { area, category, enginePosts, duplicate, keywordMissing, score };
  }).filter((item) => !item.duplicate && (item.area.contentNeed || item.area.coverage < 75 || item.enginePosts.length < 3))
    .sort((left, right) => right.score - left.score);

  const existing = await db.select().from(contentOpportunities);
  const candidateKeys = new Set(candidates.map((item) => `framework:${item.area.id}`));
  for (const item of existing) {
    if (item.status === "suggested" && !candidateKeys.has(item.sourceKey)) await db.update(contentOpportunities).set({ status: "resolved" }).where(eq(contentOpportunities.id, item.id));
    if (item.status === "resolved" && candidateKeys.has(item.sourceKey)) await db.update(contentOpportunities).set({ status: "suggested" }).where(eq(contentOpportunities.id, item.id));
  }

  for (const [index, item] of candidates.entries()) {
    const priority = item.score >= 80 ? "high" : item.score >= 50 ? "medium" : "low";
    const title = `${item.area.name}: OP8 Uygulama Rehberi`;
    const details = [`${item.area.engine} motorunda ${item.enginePosts.length} aktif içerik bulunuyor.`, `Framework kapsamı %${item.area.coverage}.`];
    if (item.area.contentNeed) details.push("Framework alanı içerik ihtiyacı olarak işaretlenmiş.");
    if (item.keywordMissing) details.push("Odak anahtar kelimeyi karşılayan etiket bulunamadı.");
    const values = {
      sourceKey: `framework:${item.area.id}`, title, description: details.join(" "), engine: item.area.engine,
      frameworkAreaId: item.area.id, categoryId: item.category?.id ?? null, contentType: item.area.level >= 5 ? "template" : "article",
      priority, focusKeyword: item.area.name, suggestedPublishAt: futureDate(index), status: "suggested",
    };
    await db.insert(contentOpportunities).values(values).onDuplicateKeyUpdate({ set: {
      title: values.title, description: values.description, engine: values.engine, frameworkAreaId: values.frameworkAreaId,
      categoryId: values.categoryId, contentType: values.contentType, priority: values.priority,
      focusKeyword: values.focusKeyword, suggestedPublishAt: values.suggestedPublishAt,
    } });
  }
  const result = await db.select().from(contentOpportunities).where(eq(contentOpportunities.status, "suggested"))
    .orderBy(asc(contentOpportunities.suggestedPublishAt));
  const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return result.sort((left, right) => (rank[left.priority] ?? 3) - (rank[right.priority] ?? 3));
}
