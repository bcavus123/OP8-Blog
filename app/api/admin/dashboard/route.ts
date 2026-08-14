import { desc, eq, or, sql } from "drizzle-orm";
import { getDb, getPool } from "../../../../db";
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
  const performance = await performanceMetrics();
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
    performance,
    analytics: analytics.reverse(),
  });
}

const change = (current: number, previous: number) => previous ? Math.round(((current - previous) / previous) * 1000) / 10 : current ? 100 : 0;
async function performanceMetrics() {
  try {
    const [aggregateRows, dailyRows, leadRows, leadDailyRows] = await Promise.all([
      getPool().query<any[]>(`SELECT
        SUM(CASE WHEN event_type='pageview' AND channel='organic' AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) organic_current,
        SUM(CASE WHEN event_type='pageview' AND channel='organic' AND created_at>=DATE_SUB(NOW(),INTERVAL 60 DAY) AND created_at<DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) organic_previous,
        AVG(CASE WHEN event_type='engagement' AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) THEN duration_seconds END) engagement_current,
        AVG(CASE WHEN event_type='engagement' AND created_at>=DATE_SUB(NOW(),INTERVAL 60 DAY) AND created_at<DATE_SUB(NOW(),INTERVAL 30 DAY) THEN duration_seconds END) engagement_previous,
        SUM(CASE WHEN event_type='pageview' AND path LIKE '%framework%' AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) framework_current,
        SUM(CASE WHEN event_type='pageview' AND path LIKE '%framework%' AND created_at>=DATE_SUB(NOW(),INTERVAL 60 DAY) AND created_at<DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) framework_previous
        FROM analytics_events`),
      getPool().query<any[]>(`SELECT DATE(created_at) date,
        SUM(CASE WHEN event_type='pageview' AND channel='organic' THEN 1 ELSE 0 END) organic,
        ROUND(AVG(CASE WHEN event_type='engagement' THEN duration_seconds END)) engagement,
        SUM(CASE WHEN event_type='pageview' AND path LIKE '%framework%' THEN 1 ELSE 0 END) framework
        FROM analytics_events WHERE created_at>=DATE_SUB(CURDATE(),INTERVAL 11 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at)`),
      getPool().query<any[]>(`SELECT
        SUM(CASE WHEN created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) leads_current,
        SUM(CASE WHEN created_at>=DATE_SUB(NOW(),INTERVAL 60 DAY) AND created_at<DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) leads_previous
        FROM crm_leads`),
      getPool().query<any[]>(`SELECT DATE(created_at) date,COUNT(*) value FROM crm_leads WHERE created_at>=DATE_SUB(CURDATE(),INTERVAL 11 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at)`),
    ]);
    const aggregate = aggregateRows[0][0] || {}, leads = leadRows[0][0] || {}, daily = dailyRows[0] || [];
    const values = {
      organic: Number(aggregate.organic_current || 0), engagement: Math.round(Number(aggregate.engagement_current || 0)),
      framework: Number(aggregate.framework_current || 0), leads: Number(leads.leads_current || 0),
    };
    return {
      organic: { value: values.organic, change: change(values.organic, Number(aggregate.organic_previous || 0)), series: daily.map((row: any) => Number(row.organic || 0)) },
      engagement: { value: values.engagement, change: change(values.engagement, Number(aggregate.engagement_previous || 0)), series: daily.map((row: any) => Number(row.engagement || 0)) },
      framework: { value: values.framework, change: change(values.framework, Number(aggregate.framework_previous || 0)), series: daily.map((row: any) => Number(row.framework || 0)) },
      leads: { value: values.leads, change: change(values.leads, Number(leads.leads_previous || 0)), series: (leadDailyRows[0] || []).map((row: any) => Number(row.value || 0)) },
    };
  } catch { return { organic: { value: 0, change: 0, series: [] }, engagement: { value: 0, change: 0, series: [] }, framework: { value: 0, change: 0, series: [] }, leads: { value: 0, change: 0, series: [] } }; }
}
