import { desc, eq } from "drizzle-orm";
import { getDb, getPool } from "../../../../db";
import { researchItems } from "../../../../db/schema";
import { apiPermission } from "../../../admin-auth";

const values = (input: Record<string, unknown>) => ({
  title: String(input.title ?? "").trim(),
  author: String(input.author ?? "").trim(),
  type: String(input.type ?? "Report"),
  engine: String(input.engine ?? "Value Creation"),
  source: String(input.source ?? "").trim(),
  sourceUrl: String(input.sourceUrl ?? ""),
  publicationYear: Number(input.publicationYear || new Date().getFullYear()),
  status: String(input.status ?? "review"),
  favorite: input.favorite ? 1 : 0,
  citationCount: Number(input.citationCount || 0),
  notes: String(input.notes ?? ""),
});

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await getPool().query(`CREATE TABLE IF NOT EXISTS research_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(190) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Report',
    engine VARCHAR(80) NOT NULL DEFAULT 'Value Creation',
    source VARCHAR(190) NOT NULL,
    source_url TEXT NOT NULL,
    publication_year INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'review',
    favorite INT NOT NULL DEFAULT 0,
    citation_count INT NOT NULL DEFAULT 0,
    notes TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_research_status(status),
    INDEX idx_research_engine(engine),
    INDEX idx_research_year(publication_year)
  )`);
  schemaReady = true;
}

async function authorized() {
  const actor = await apiPermission("research.manage");
  return actor.error ?? null;
}

function failure(error: unknown) {
  console.error("Research API error", error);
  return Response.json(
    { error: "Araştırma işlemi tamamlanamadı. Lütfen tekrar deneyin." },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const error = await authorized();
    if (error) return error;
    await ensureSchema();
    const items = await getDb()
      .select()
      .from(researchItems)
      .orderBy(desc(researchItems.updatedAt), desc(researchItems.id));
    return Response.json({ items });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const error = await authorized();
    if (error) return error;
    await ensureSchema();
    const value = values((await request.json()) as Record<string, unknown>);
    if (!value.title || !value.source) {
      return Response.json({ error: "Başlık ve kaynak zorunludur." }, { status: 400 });
    }
    const ids = await getDb().insert(researchItems).values(value).$returningId();
    return Response.json({ id: ids[0].id }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  try {
    const error = await authorized();
    if (error) return error;
    await ensureSchema();
    const input = (await request.json()) as Record<string, unknown>;
    const id = Number(input.id);
    if (!id) return Response.json({ error: "Kayıt bulunamadı." }, { status: 400 });
    await getDb().update(researchItems).set(values(input)).where(eq(researchItems.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const error = await authorized();
    if (error) return error;
    await ensureSchema();
    const input = (await request.json()) as { id?: number; favorite?: boolean; status?: string };
    if (!input.id) return Response.json({ error: "Kayıt bulunamadı." }, { status: 400 });
    const change = input.favorite !== undefined
      ? { favorite: input.favorite ? 1 : 0 }
      : { status: String(input.status ?? "review") };
    await getDb().update(researchItems).set(change).where(eq(researchItems.id, input.id));
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const error = await authorized();
    if (error) return error;
    await ensureSchema();
    const { id } = (await request.json()) as { id?: number };
    if (!id) return Response.json({ error: "Kayıt bulunamadı." }, { status: 400 });
    await getDb().delete(researchItems).where(eq(researchItems.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
