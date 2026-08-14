import { desc, eq, or, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminUsers, analyticsDaily, categories, media, posts } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { refreshContentOpportunities } from "../../../content-opportunities";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const db = getDb();
  const [admin] = await db.select({ status: adminUsers.status }).from(adminUsers)
    .where(or(eq(adminUsers.userId, user.userId), eq(adminUsers.email, user.email))).limit(1);
  if (!admin || admin.status !== "active") return Response.json({ error: "Yetkisiz" }, { status: 401 });

  const [allPosts, [categoryCount], [mediaCount], [userCount], recent, analytics] = await Promise.all([
    db.select({
      status: posts.status,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      coverUrl: posts.coverUrl,
      coverAlt: posts.coverAlt,
    }).from(posts),
    db.select({ value: sql<number>`count(*)` }).from(categories),
    db.select({ value: sql<number>`count(*)` }).from(media),
    db.select({ value: sql<number>`count(*)` }).from(adminUsers),
    db.select({ id: posts.id, title: posts.title, status: posts.status, updatedAt: posts.updatedAt })
      .from(posts).orderBy(desc(posts.updatedAt)).limit(5),
    db.select().from(analyticsDaily).orderBy(desc(analyticsDaily.date)).limit(7),
  ]);

  const countStatus = (status: string) => allPosts.filter((post) => post.status === status).length;
  const seoIssues = allPosts.filter((post) =>
    !post.seoTitle.trim()
    || !post.seoDescription.trim()
    || Boolean(post.coverUrl && !post.coverAlt.trim())
  ).length;

  const opportunities = await refreshContentOpportunities();
  return Response.json({
    stats: {
      posts: allPosts.length,
      idea: countStatus("idea"),
      published: countStatus("published"),
      draft: countStatus("draft"),
      review: countStatus("review"),
      approved: countStatus("approved"),
      scheduled: countStatus("scheduled"),
      seoIssues,
      categories: Number(categoryCount.value),
      media: Number(mediaCount.value),
      users: Number(userCount.value),
    },
    recent,
    opportunities: opportunities.slice(0, 3),
    analytics: analytics.reverse(),
  });
}
