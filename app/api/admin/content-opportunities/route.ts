import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { contentOpportunities, posts } from "../../../../db/schema";
import { apiPermission } from "../../../admin-auth";
import { ensureOpportunityTable, refreshContentOpportunities } from "../../../content-opportunities";

const slugify = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

export async function GET() {
  const access = await apiPermission("posts.read");
  if (access.error) return access.error;
  try { return Response.json({ items: await refreshContentOpportunities() }); }
  catch (error) { return Response.json({ error: "İçerik fırsatları analiz edilemedi.", detail: String(error) }, { status: 500 }); }
}

export async function POST(request: Request) {
  const access = await apiPermission("posts.write");
  if (access.error) return access.error;
  await ensureOpportunityTable();
  const input = await request.json() as { id?: number; action?: string };
  const id = Number(input.id);
  if (!id) return Response.json({ error: "Fırsat bulunamadı." }, { status: 400 });
  const db = getDb();
  const [item] = await db.select().from(contentOpportunities).where(eq(contentOpportunities.id, id));
  if (!item || item.status !== "suggested") return Response.json({ error: "Fırsat artık kullanılamıyor." }, { status: 409 });
  if (input.action === "dismiss") {
    await db.update(contentOpportunities).set({ status: "dismissed" }).where(eq(contentOpportunities.id, id));
    return Response.json({ ok: true });
  }
  if (input.action !== "convert") return Response.json({ error: "Geçersiz işlem." }, { status: 400 });
  const duplicate = await db.select({ id: posts.id }).from(posts).where(eq(posts.title, item.title)).limit(1);
  if (duplicate.length) return Response.json({ error: "Bu konu için zaten bir içerik bulunuyor." }, { status: 409 });
  const slug = `${slugify(item.title)}-${item.id}`;
  const ids = await db.insert(posts).values({
    title: item.title, slug, excerpt: item.description, content: `<h2>${item.focusKeyword}</h2><p>${item.description}</p>`,
    status: "idea", categoryId: item.categoryId, authorId: access.actor.bootstrap ? null : Number(access.actor.userId),
    coverUrl: "", coverAlt: "", seoTitle: item.title.slice(0, 60), seoDescription: item.description.slice(0, 160), publishedAt: null,
  }).$returningId();
  await db.update(contentOpportunities).set({ status: "converted", postId: ids[0].id }).where(eq(contentOpportunities.id, id));
  return Response.json({ ok: true, postId: ids[0].id, status: "idea" }, { status: 201 });
}
