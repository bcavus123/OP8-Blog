import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../db";
import { categories, posts } from "../../db/schema";
import { AdminNav } from "../admin/AdminNav";
import PostManagerRich from "../admin/yazilar/PostManagerRich";
import "../admin/yazilar/content.css";
import "../admin/yazilar/word-editor.css";
import "../admin/yazilar/word-editor-layout.css";
import "../admin/yazilar/advanced-seo.css";

export const dynamic = "force-dynamic";

export default async function ContentPreview() {
  if (process.env.LOCAL_TEST_MODE !== "1") notFound();
  const db = getDb();
  let realPosts: Array<{ id: number; title: string; slug: string; excerpt: string; content: string; status: string; categoryId: number | null; categoryName: string | null; coverUrl: string; coverAlt: string; seoTitle: string; seoDescription: string; publishedAt: string | null; updatedAt: string }> = [];
  let realCategories: Array<{ id: number; name: string }> = [];
  try {
    [realPosts, realCategories] = await Promise.all([
      db.select({ id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, content: posts.content, status: posts.status, categoryId: posts.categoryId, categoryName: categories.name, coverUrl: posts.coverUrl, coverAlt: posts.coverAlt, seoTitle: posts.seoTitle, seoDescription: posts.seoDescription, publishedAt: posts.publishedAt, updatedAt: posts.updatedAt }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).orderBy(desc(posts.updatedAt), desc(posts.id)),
      db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    ]);
  } catch {
    // Yerel veritabanı bağlı değilse bile tasarım örnek içerikle açılır.
  }
  const actor = { userId: "preview", email: "preview@op8.local", displayName: "OP8 Admin", fullName: "OP8 Admin", role: "super_admin" as const, status: "active" };
  return <main><AdminNav active="/admin/yazilar" actor={actor} /><PostManagerRich preview initialPosts={realPosts} initialCategories={realCategories} /></main>;
}
