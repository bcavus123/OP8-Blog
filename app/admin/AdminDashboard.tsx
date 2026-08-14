"use client";

import { CSSProperties, useEffect, useState } from "react";

export type DashboardData = {
  stats: { posts: number; idea: number; published: number; draft: number; review: number; approved: number; scheduled: number; seoIssues: number; categories: number; media: number; users: number };
  recent: Array<{ id: number; title: string; status: string; updatedAt: string }>;
  analytics: Array<{ date: string; views: number; visitors: number }>;
  opportunities: Array<{ id: number; title: string; description: string; engine: string; priority: string; contentType: string; suggestedPublishAt: string | null }>;
  performance: Record<"organic" | "engagement" | "framework" | "leads", { value: number; change: number; series: number[] }>;
  seo: { score: number; metaIssues: number; brokenLinks: number; orphanPages: number; missingAlt: number };
};

const engines = [
  ["Growth", 92, "#2da454"], ["Sales", 81, "#0874df"], ["Delivery", 64, "#f17a00"],
  ["Operations", 87, "#13a6ad"], ["People", 73, "#7244c7"], ["Profitability", 90, "#54ad51"],
  ["Portfolio", 52, "#f0b400"], ["Customer Success", 46, "#ef3d36"],
] as const;

const pipeline = [["Fikir", "idea", "#0873ed", "◉"], ["Taslak", "draft", "#f0a800", "✎"], ["İnceleme", "review", "#7044c7", "♙"], ["Onaylandı", "approved", "#17a49e", "✓"], ["Yayında", "published", "#54a953", "➤"]] as const;

function statusLabel(status: string) {
  return status === "published" ? "Yayında" : status === "scheduled" ? "Planlandı" : "Taslak";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("tr-TR") || "OP";
}

export default function AdminDashboard({ displayName, initialData }: { displayName: string; initialData?: DashboardData }) {
  const [data, setData] = useState<DashboardData | null>(initialData ?? null);
  useEffect(() => {
    if (initialData) return;
    const emptyMetric = { value: 0, change: 0, series: [] };
    const empty: DashboardData = { stats: { posts: 0, idea: 0, published: 0, draft: 0, review: 0, approved: 0, scheduled: 0, seoIssues: 0, categories: 0, media: 0, users: 0 }, recent: [], analytics: [], opportunities: [], performance: { organic: emptyMetric, engagement: emptyMetric, framework: emptyMetric, leads: emptyMetric }, seo: { score: 0, metaIssues: 0, brokenLinks: 0, orphanPages: 0, missingAlt: 0 } };
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Dashboard verisi alınamadı: ${response.status}`);
        const payload = await response.json() as Partial<DashboardData>;
        if (!payload.stats || !Array.isArray(payload.recent) || !Array.isArray(payload.analytics)) throw new Error("Dashboard verisi geçersiz");
        setData(payload as DashboardData);
      })
      .catch(() => setData(empty));
  }, [initialData]);

  const posts = data?.stats.posts ?? 0;
  const recent = data?.recent ?? [];
  const summary = [
    ["Toplam İçerik", posts, "#0874ed", "▤"], ["Yayında", data?.stats.published ?? 0, "#46aa5d", "✓"],
    ["Taslak", data?.stats.draft ?? 0, "#ffb000", "✎"], ["İncelemede", data?.stats.review ?? 0, "#7245cb", "♙"],
    ["Planlandı", data?.stats.scheduled ?? 0, "#f05d18", "▣"], ["SEO Sorunu", data?.stats.seoIssues ?? 0, "#ed4148", "△"],
  ] as const;
  async function convertOpportunity(id: number) { const response = await fetch("/api/admin/content-opportunities", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: "convert" }) }); const payload = await response.json(); if (!response.ok) { alert(payload.error || "Fırsat fikre dönüştürülemedi."); return; } location.href = "/admin/yazilar"; }

  return <div className="op8-dashboard">
    <div className="op8-topbar">
      <a className="op8-notification" href="/admin/seo" aria-label="Bildirimler">♧<b>3</b></a>
      <span className="op8-top-avatar">{initials(displayName)}</span>
    </div>
    <header className="op8-dashboard-head">
      <div><h1>Merhaba, {displayName} 👋</h1><p>OP8 içeriğinizde bugün neler olduğuna göz atın.</p></div>
      <div className="op8-health"><span>İçerik Sağlığı ⓘ</span><span className="op8-health-track"><span /></span><strong>91%</strong></div>
    </header>
    <section className="op8-summary" aria-label="İçerik özeti">
      {summary.map(([label, value, color, icon]) => <div className="op8-summary-item" key={label}>
        <span className="op8-summary-icon" style={{ "--accent": color } as CSSProperties}>{icon}</span><span><strong>{value}</strong><small>{label}</small></span>
      </div>)}
    </section>
    <div className="op8-dashboard-grid">
      <section className="op8-panel"><h2>Son İçerikler</h2><table className="op8-panel-table"><thead><tr><th>Başlık</th><th>Tür</th><th>Durum</th><th>Güncellendi</th></tr></thead><tbody>
        {(recent.length ? recent : [{ id: 0, title: "Henüz içerik bulunmuyor", status: "draft", updatedAt: "—" }]).slice(0, 5).map((post) => <tr key={post.id}><td><strong>{post.title}</strong><small>{post.id ? `/yazilar/${post.id}` : "Yeni bir içerik oluşturarak başlayın"}</small></td><td>Yazı</td><td><span className={`op8-badge ${post.status}`}>{statusLabel(post.status)}</span></td><td>{post.updatedAt === "—" ? "—" : new Date(post.updatedAt).toLocaleDateString("tr-TR")}</td></tr>)}
      </tbody></table><a className="op8-view-link" href="/admin/yazilar">Tüm içerikleri görüntüle →</a></section>
      <section className="op8-panel"><h2>OP8 Framework Kapsamı</h2><div className="op8-engine-list">{engines.map(([name, score, color]) => <div className="op8-engine-row" key={name} style={{ "--engine": color } as CSSProperties}><span>{name}</span><span className="op8-engine-track"><i style={{ width: `${score}%` }} /></span><span>{score}%</span></div>)}</div></section>
      <section className="op8-panel"><h2>Editoryal Akış</h2><div className="op8-pipeline">{pipeline.map(([label, status, color, icon]) => <div className="op8-pipeline-step" key={label} style={{ "--step": color } as CSSProperties}><i>{icon}</i><span>{label}</span><strong>{data?.stats[status] ?? 0}</strong></div>)}</div></section>
      <section className="op8-panel"><h2>SEO Sağlığı</h2><div className="op8-seo"><div><div className="op8-score" style={{ "--seo-score": `${Math.max(0, Math.min(100, data?.seo?.score ?? 0)) * 3.6}deg` } as CSSProperties}>{data?.seo?.score ?? 0}</div><a className="op8-view-link" href="/admin/seo">SEO raporunu aç →</a></div><div className="op8-issue-list"><span style={{ "--issue": "#ef3b43" } as CSSProperties}>{data?.seo?.metaIssues ?? 0} Meta sorunu</span><span style={{ "--issue": "#f47521" } as CSSProperties}>{data?.seo?.brokenLinks ?? 0} Kırık iç bağlantı</span><span style={{ "--issue": "#f0b300" } as CSSProperties}>{data?.seo?.orphanPages ?? 0} Sahipsiz sayfa</span><span style={{ "--issue": "#0873ed" } as CSSProperties}>{data?.seo?.missingAlt ?? 0} Eksik alt metin</span></div></div></section>
      <section className="op8-panel"><h2>İçerik Fırsatları</h2><div className="op8-opportunities">{(data?.opportunities ?? []).map((item) => <div className="op8-opportunity" key={item.id}><span>{item.priority === "high" ? "!" : "◔"}</span><div><strong>{item.title}</strong><small>{item.engine} · {item.description}</small></div><button onClick={() => convertOpportunity(item.id)}>Fikre dönüştür</button></div>)}{!data?.opportunities?.length && <div className="op8-opportunity"><span>✓</span><div><strong>Yeni içerik açığı bulunmadı</strong><small>Framework kapsamı ve mevcut içerikler dengeli görünüyor.</small></div></div>}</div><a className="op8-view-link" href="/admin/yazilar">İçerik planına git →</a></section>
      <section className="op8-panel"><h2>Son Hareketler</h2><div className="op8-activity">{(data?.recent ?? []).slice(0, 4).map((post, index) => <div className="op8-activity-row" key={post.id}><span>{index === 0 ? "Bugün" : `${index + 1} gün`}</span><strong>“{post.title}” güncellendi</strong></div>)}{!data?.recent.length && <div className="op8-activity-row"><span>—</span><strong>Henüz hareket bulunmuyor.</strong></div>}</div><a className="op8-view-link" href="/admin/yazilar">Tüm hareketler →</a></section>
      <section className="op8-panel op8-performance"><Metric label="Organik Trafik" value={String(data?.performance?.organic.value ?? 0)} change={data?.performance?.organic.change ?? 0} series={data?.performance?.organic.series ?? []} color="#0873ed"/><Metric label="Etkileşim (Ort. Süre)" value={formatDuration(data?.performance?.engagement.value ?? 0)} change={data?.performance?.engagement.change ?? 0} series={data?.performance?.engagement.series ?? []} color="#7743ee"/><Metric label="Framework Ziyareti" value={String(data?.performance?.framework.value ?? 0)} change={data?.performance?.framework.change ?? 0} series={data?.performance?.framework.series ?? []} color="#10a6a6"/><Metric label="Potansiyel Müşteri" value={String(data?.performance?.leads.value ?? 0)} change={data?.performance?.leads.change ?? 0} series={data?.performance?.leads.series ?? []} color="#f36a21"/></section>
    </div>
  </div>;
}

function formatDuration(seconds: number) { const minutes = Math.floor(seconds / 60), remainder = Math.max(0, Math.round(seconds % 60)); return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`; }
function Metric({ label, value, color, change, series }: { label: string; value: string; color: string; change: number; series: number[] }) {
  const source = series.length ? series : [0, 0, 0, 0, 0, 0, 0]; const max = Math.max(1, ...source); const heights = source.map((item) => Math.max(8, Math.round((item / max) * 100)));
  return <div className="op8-metric"><span>{label}</span><strong>{value}</strong><em className={change < 0 ? "negative" : ""}>{change < 0 ? "▼" : "▲"} {Math.abs(change)}%</em><div className="op8-spark" style={{ "--spark": color } as CSSProperties}>{heights.map((height, index) => <i key={index} style={{ "--h": `${height}%` } as CSSProperties} />)}</div></div>;
}
