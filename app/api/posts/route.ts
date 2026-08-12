Exit code: 0
Wall time: 2.9 seconds
Output:
import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { categories, posts } from "../../../db/schema";

export async function GET() {
  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const items = await getDb()
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        coverUrl: posts.coverUrl,
        coverAlt: posts.coverAlt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(eq(posts.status, "published"), isNotNull(posts.publishedAt), lte(posts.publishedAt, now)))
      .orderBy(desc(posts.publishedAt), desc(posts.id));

    const topicRows = await getDb().select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
    const counts = new Map<number, number>();
    for (const item of items) if (item.categoryId) counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);

    return Response.json({
      posts: items,
      topics: topicRows.map((topic) => ({ ...topic, postCount: counts.get(topic.id) ?? 0 })).filter((topic) => topic.postCount > 0),
    });
  } catch {
    return Response.json({ posts: [], topics: [] });
  }
}

