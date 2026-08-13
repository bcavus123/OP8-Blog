import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("OP8 ana sayfası sunucu tarafında doğru marka ve Türkçe içerikle oluşur", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="tr">/i);
  assert.match(html, /OP8 Operating Partner Value Creation Framework/i);
  assert.match(html, /Son yazıları keşfet/i);
  assert.match(html, /Giriş yap/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("yönetim ve önizleme rotaları proje içinde tanımlıdır", async () => {
  const [nav, content, category, dashboard] = await Promise.all([
    readFile(new URL("../app/admin/AdminNav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/content-preview/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/category-preview/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard-preview/page.tsx", import.meta.url), "utf8"),
  ]);
  for (const route of ["/admin/yazilar", "/admin/kategoriler", "/admin/etiketler", "/admin/research", "/admin/medya", "/admin/seo"]) {
    assert.match(nav, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(content, /PostManagerRich/);
  assert.match(category, /CategoryManager/);
  assert.match(dashboard, /AdminDashboard/);
});
