"use client";

import { CSSProperties, useEffect, useState } from "react";

export type DashboardData = {
  stats: { posts: number; published: number; draft: number; review: number; scheduled: number; seoIssues: number; categories: number; media: number; users: number };
  recent: Array<{ id: number; title: string; status: string; updatedAt: string }>;
  analytics: Array<{ date: string; views: number; visitors: number }>;
};

const engines = [
  ["Growth", 92, "#2da454"], ["Sales", 81, "#0874df"], ["Delivery", 64, "#f17a00"],
  ["Operations", 87, "#13a6ad"], ["People", 73, "#7244c7"], ["Profitability", 90, "#54ad51"],
  ["Portfolio", 52, "#f0b400"], ["Customer Success", 46, "#ef3d36"],
] as const;

const pipeline = [["Fikir", "18", "#0873ed", "◉"], ["Taslak", "21", "#f0a800", "✎"], ["İnceleme", "8", "#7044c7", "♙"], ["Onaylandı", "4", "#17a49e", "✓"], ["Yayında", "96", "#54a953", "➤"]] as const;

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
    const empty: DashboardData = { stats: { posts: 0, published: 0, draft: 0, review: 0, scheduled: 0, seoIssues: 0, categories: 0, media: 0, users: 0 }, recent: [], analytics: [] };
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
      <section className="op8-panel"><h2>Editoryal Akış</h2><div className="op8-pipeline">{pipeline.map(([label, value, color, icon]) => <div className="op8-pipeline-step" key={label} style={{ "--step": color } as CSSProperties}><i>{icon}</i><span>{label}</span><strong>{label === "Yayında" ? published : label === "Taslak" ? draft : value}</strong></div>)}</div></section>
      <section className="op8-panel"><h2>SEO Sağlığı</h2><div className="op8-seo"><div><div className="op8-score">86</div><a className="op8-view-link" href="/admin/seo">SEO raporunu aç →</a></div><div className="op8-issue-list"><span style={{ "--issue": "#ef3b43" } as CSSProperties}>0 Meta sorunu</span><span style={{ "--issue": "#f47521" } as CSSProperties}>0 Kırık bağlantı</span><span style={{ "--issue": "#f0b300" } as CSSProperties}>0 Sahipsiz sayfa</span><span style={{ "--issue": "#0873ed" } as CSSProperties}>0 Eksik alt metin</span></div></div></section>
      <section className="op8-panel"><h2>İçerik Fırsatları</h2><div className="op8-opportunities"><div className="op8-opportunity"><span>♡</span><div><strong>Customer Success kapsamını artırın</strong><small>Bu değer motorunda yeni içerik fırsatları var.</small></div></div><div className="op8-opportunity"><span>◔</span><div><strong>Portfolio içerik planı</strong><small>Framework kapsamını yeni yazılarla genişletin.</small></div></div><div className="op8-opportunity"><span>▤</span><div><strong>100 Günlük Plan serisi</strong><small>Operating Partner metodolojisini derinleştirin.</small></div></div></div><a className="op8-view-link" href="/admin/yazilar">İçerik planına git →</a></section>
      <section className="op8-panel"><h2>Son Hareketler</h2><div className="op8-activity">{(data?.recent ?? []).slice(0, 4).map((post, index) => <div className="op8-activity-row" key={post.id}><span>{index === 0 ? "Bugün" : `${index + 1} gün`}</span><strong>“{post.title}” güncellendi</strong></div>)}{!data?.recent.length && <div className="op8-activity-row"><span>—</span><strong>Henüz hareket bulunmuyor.</strong></div>}</div><a className="op8-view-link" href="/admin/yazilar">Tüm hareketler →</a></section>
      <section className="op8-panel op8-performance"><Metric label="Organik Trafik" value={String((data?.analytics ?? []).reduce((sum, day) => sum + Number(day.views), 0))} color="#0873ed"/><Metric label="Etkileşim (Ort. Süre)" value="02:48" color="#7743ee"/><Metric label="Framework Ziyareti" value={String((data?.analytics ?? []).reduce((sum, day) => sum + Number(day.visitors), 0))} color="#10a6a6"/><Metric label="Potansiyel Müşteri" value="0" color="#f36a21"/></section>
    </div>
  </div>;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  const heights = [32, 44, 38, 58, 42, 66, 50, 62, 45, 68, 55, 72];
  return <div className="op8-metric"><span>{label}</span><strong>{value}</strong><em>▲ 0%</em><div className="op8-spark" style={{ "--spark": color } as CSSProperties}>{heights.map((height, index) => <i key={index} style={{ "--h": `${height}%` } as CSSProperties} />)}</div></div>;
}
