import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { categories, posts } from "../../../../db/schema";
import { Actor, apiPermission, can } from "../../../admin-auth";
import { recordContentActivity } from "../../../content-activity";

const allStatuses = ["idea", "draft", "review", "approved", "scheduled", "published"] as const;
type EditorialStatus = typeof allStatuses[number];

const slugify = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "").slice(0, 80);
const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const allowedStatuses = (actor: Actor): EditorialStatus[] => {
  if (actor.role === "super_admin" || actor.role === "admin") return [...allStatuses];
  if (actor.role === "editor") return ["draft", "review", "approved"];
  return ["idea", "draft"];
};
const validStatus = (value: unknown): value is EditorialStatus => allStatuses.includes(String(value) as EditorialStatus);
const statusError = () => Response.json({ error: "Rolünüz bu editoryal aşamayı seçmeye yetkili değil." }, { status: 403 });

function values(input: Record<string, unknown>, status: EditorialStatus) {
  return {
    title: String(input.title ?? "").trim(),
    slug: slugify(String(input.slug || input.title || "")),
    excerpt: String(input.excerpt ?? ""),
    content: String(input.content ?? ""),
    status,
    categoryId: input.categoryId ? Number(input.categoryId) : null,
    coverUrl: String(input.coverUrl ?? ""),
    coverAlt: String(input.coverAlt ?? ""),
    seoTitle: String(input.seoTitle ?? ""),
    seoDescription: String(input.seoDescription ?? ""),
    publishedAt: input.publishedAt ? String(input.publishedAt) : status === "published" ? now() : null,
  };
}

async function owned(id: number, actor: Actor) {
  if (actor.role !== "author") return true;
  const [row] = await getDb().select({ id: posts.id }).from(posts)
    .where(and(eq(posts.id, id), eq(posts.authorId, Number(actor.userId))));
  return Boolean(row);
}

export async function GET() {
  const access = await apiPermission("posts.read");
  if (access.error) return access.error;
  const db = getDb();
  const own = access.actor.role === "author" ? eq(posts.authorId, Number(access.actor.userId)) : undefined;
  const list = await db.select({
    id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, content: posts.content,
    status: posts.status, categoryId: posts.categoryId, authorId: posts.authorId, categoryName: categories.name,
    coverUrl: posts.coverUrl, coverAlt: posts.coverAlt, seoTitle: posts.seoTitle,
    seoDescription: posts.seoDescription, publishedAt: posts.publishedAt, updatedAt: posts.updatedAt,
  }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(own)
    .orderBy(desc(posts.updatedAt), desc(posts.id));
  const statuses = allowedStatuses(access.actor);
  return Response.json({
    posts: list,
    categories: await db.select().from(categories).orderBy(asc(categories.sortOrder)),
    capabilities: {
      publish: statuses.includes("published"), delete: can(access.actor, "posts.delete"),
      ownOnly: access.actor.role === "author", allowedStatuses: statuses, role: access.actor.role,
    },
  });
}

export async function POST(request: Request) {
  const access = await apiPermission("posts.write");
  if (access.error) return access.error;
  const input = await request.json() as Record<string, unknown>;
  const requested = validStatus(input.status) ? input.status : access.actor.role === "author" ? "idea" : "draft";
  if (!allowedStatuses(access.actor).includes(requested)) return statusError();
  const value = values(input, requested);
  if (!value.title || !value.slug) return Response.json({ error: "Başlık ve geçerli slug zorunludur." }, { status: 400 });
  try {
    const ids = await getDb().insert(posts).values({ ...value, authorId: access.actor.bootstrap ? null : Number(access.actor.userId) }).$returningId();
    await recordContentActivity({ postId: ids[0].id, postTitle: value.title, action: "created", description: `“${value.title}” ${requested === "idea" ? "fikir olarak" : "içerik olarak"} oluşturuldu.`, actorEmail: access.actor.email });
    return Response.json({ id: ids[0].id }, { status: 201 });
  } catch { return Response.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 }); }
}

export async function PUT(request: Request) {
  const access = await apiPermission("posts.write");
  if (access.error) return access.error;
  const input = await request.json() as Record<string, unknown>;
  const id = Number(input.id);
  if (!id || !validStatus(input.status)) return Response.json({ error: "Eksik veya geçersiz alan var." }, { status: 400 });
  if (!await owned(id, access.actor)) return Response.json({ error: "Yalnızca kendi yazılarınızı düzenleyebilirsiniz." }, { status: 403 });
  const [existing] = await getDb().select({ status: posts.status }).from(posts).where(eq(posts.id, id));
  if (!existing) return Response.json({ error: "Yazı bulunamadı." }, { status: 404 });
  if (access.actor.role === "author" && !["idea", "draft"].includes(existing.status)) return statusError();
  if (!allowedStatuses(access.actor).includes(input.status)) return statusError();
  const value = values(input, input.status);
  if (!value.title || !value.slug) return Response.json({ error: "Eksik alan var." }, { status: 400 });
  try {
    await getDb().update(posts).set(value).where(eq(posts.id, id));
    await recordContentActivity({ postId: id, postTitle: value.title, action: "updated", description: `“${value.title}” güncellendi.`, actorEmail: access.actor.email });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 }); }
}

export async function PATCH(request: Request) {
  const access = await apiPermission("posts.write");
  if (access.error) return access.error;
  const { id, status, publishedAt } = await request.json() as { id?: number; status?: unknown; publishedAt?: string | null };
  if (!id || !validStatus(status)) return Response.json({ error: "Geçersiz işlem." }, { status: 400 });
  if (!await owned(id, access.actor)) return Response.json({ error: "Yalnızca kendi yazılarınızı yönetebilirsiniz." }, { status: 403 });
  if (!allowedStatuses(access.actor).includes(status)) return statusError();
  if (status === "scheduled" && !publishedAt) return Response.json({ error: "Planlanan yayın zamanı zorunludur." }, { status: 400 });
  await getDb().update(posts).set({
    status,
    publishedAt: status === "published" ? now() : status === "scheduled" ? publishedAt : null,
  }).where(eq(posts.id, id));
  const [post] = await getDb().select({ title: posts.title }).from(posts).where(eq(posts.id, id));
  const actionLabels: Record<string, string> = { idea: "Fikir aşamasına alındı", draft: "Taslağa alındı", review: "İncelemeye gönderildi", approved: "Onaylandı", scheduled: "Yayınlanmak üzere planlandı", published: "Yayımlandı" };
  await recordContentActivity({ postId: id, postTitle: post?.title || "İçerik", action: status, description: `“${post?.title || "İçerik"}” ${actionLabels[status]}.`, actorEmail: access.actor.email });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const access = await apiPermission("posts.delete");
  if (access.error) return access.error;
  const { id } = await request.json() as { id?: number };
  if (!id) return Response.json({ error: "Yazı bulunamadı." }, { status: 400 });
  const [post] = await getDb().select({ title: posts.title }).from(posts).where(eq(posts.id, id));
  await getDb().delete(posts).where(eq(posts.id, id));
  await recordContentActivity({ postId: null, postTitle: post?.title || "İçerik", action: "deleted", description: `“${post?.title || "İçerik"}” silindi.`, actorEmail: access.actor.email });
  return Response.json({ ok: true });
}
