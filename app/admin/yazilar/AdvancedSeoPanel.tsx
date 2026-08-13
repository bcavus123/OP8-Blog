"use client";

import { useMemo, useState } from "react";

export type SeoAdvanced = {
  primaryKeyword: string; secondaryKeywords: string; canonicalUrl: string;
  robotsIndex: boolean; robotsFollow: boolean; redirectOldSlug: boolean;
  ogTitle: string; ogDescription: string; ogImage: string; twitterCard: "summary" | "summary_large_image";
  schemaType: "Article" | "BlogPosting" | "HowTo" | "FAQPage" | "NewsArticle";
  breadcrumb: boolean; externalNofollow: boolean; overrideReason: string;
};

export const defaultSeoAdvanced: SeoAdvanced = {
  primaryKeyword: "", secondaryKeywords: "", canonicalUrl: "", robotsIndex: true, robotsFollow: true,
  redirectOldSlug: true, ogTitle: "", ogDescription: "", ogImage: "", twitterCard: "summary_large_image",
  schemaType: "BlogPosting", breadcrumb: true, externalNofollow: false, overrideReason: "",
};

type Props = {
  title: string; slug: string; excerpt: string; content: string; coverUrl: string; coverAlt: string;
  seoTitle: string; seoDescription: string; value: SeoAdvanced;
  onBasicChange: (next: { seoTitle?: string; seoDescription?: string; slug?: string }) => void;
  onChange: (next: SeoAdvanced) => void;
};

const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const norm = (value: string) => value.toLocaleLowerCase("tr-TR").trim();

export default function AdvancedSeoPanel(props: Props) {
  const { value } = props;
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [social, setSocial] = useState<"linkedin" | "x">("linkedin");
  const update = (patch: Partial<SeoAdvanced>) => props.onChange({ ...value, ...patch });
  const analysis = useMemo(() => {
    const body = text(props.content), words = body ? body.split(/\s+/).length : 0;
    const key = norm(value.primaryKeyword), keyHits = key ? norm(`${props.title} ${props.excerpt} ${body}`).split(key).length - 1 : 0;
    const internal = (props.content.match(/href=["']\/(?!\/)/gi) || []).length;
    const external = (props.content.match(/href=["']https?:\/\//gi) || []).length;
    const headings = (props.content.match(/<h[1-6][^>]*>/gi) || []).length;
    const images = (props.content.match(/<img\b/gi) || []).length;
    const imageAlts = (props.content.match(/<img[^>]+alt=["'][^"']+["']/gi) || []).length;
    const checks = [
      { label: "Odak anahtar kelime belirlendi", ok: !!key, critical: true },
      { label: "Anahtar kelime SEO başlığında", ok: !!key && norm(props.seoTitle || props.title).includes(key), critical: false },
      { label: "Anahtar kelime URL içinde", ok: !!key && norm(props.slug).includes(key.replace(/\s+/g, "-")), critical: false },
      { label: "SEO başlığı 30–60 karakter", ok: (props.seoTitle || props.title).length >= 30 && (props.seoTitle || props.title).length <= 60, critical: true },
      { label: "Meta açıklaması 120–160 karakter", ok: props.seoDescription.length >= 120 && props.seoDescription.length <= 160, critical: true },
      { label: "İçerik en az 300 kelime", ok: words >= 300, critical: false },
      { label: "Alt başlık kullanılmış", ok: headings > 0, critical: false },
      { label: "Kapak görselinde alt metin var", ok: !props.coverUrl || !!props.coverAlt.trim(), critical: true },
      { label: "İçerik görsellerinin alt metni var", ok: images === imageAlts, critical: false },
      { label: "Canonical URL tanımlı", ok: !!value.canonicalUrl, critical: false },
    ];
    const score = Math.round(checks.reduce((sum, item) => sum + (item.ok ? (item.critical ? 14 : 8) : 0), 0) / checks.reduce((sum, item) => sum + (item.critical ? 14 : 8), 0) * 100);
    const sentences = body.split(/[.!?]+/).filter(Boolean).length || 1;
    const avgSentence = Math.round(words / sentences);
    const readability = Math.max(0, Math.min(100, 100 - Math.max(0, avgSentence - 14) * 3));
    return { body, words, keyHits, density: words && key ? ((keyHits / words) * 100).toFixed(1) : "0.0", internal, external, headings, images, imageAlts, checks, score, readability, minutes: Math.max(1, Math.ceil(words / 200)) };
  }, [props.title, props.slug, props.excerpt, props.content, props.coverUrl, props.coverAlt, props.seoTitle, props.seoDescription, value]);

  const displayTitle = props.seoTitle || props.title || "SEO başlığınız burada görünecek";
  const displayDescription = props.seoDescription || props.excerpt || "Arama sonuçlarında gösterilecek açıklamayı ekleyin.";
  const displayUrl = value.canonicalUrl || `https://op8.com/yazilar/${props.slug || "yazi-slug"}`;
  const critical = analysis.checks.filter((item) => item.critical && !item.ok).length;
  const schema = { "@context": "https://schema.org", "@type": value.schemaType, headline: displayTitle, description: displayDescription, image: value.ogImage || props.coverUrl || undefined, url: displayUrl, breadcrumb: value.breadcrumb ? { "@type": "BreadcrumbList" } : undefined };

  return <fieldset className="seo-studio"><legend>SEO ve yayın optimizasyonu</legend>
    <div className="seo-score-head"><div className={`seo-score-gauge ${analysis.score >= 80 ? "good" : analysis.score >= 60 ? "mid" : "low"}`}><strong>{analysis.score}</strong><span>/100</span></div><div><h3>{analysis.score >= 80 ? "SEO açısından hazır" : "SEO geliştirmeleri gerekiyor"}</h3><p>{critical ? `${critical} kritik konu yayın öncesinde çözülmeli.` : "Kritik SEO sorunu bulunmuyor."}</p></div></div>

    <section className="seo-section"><h3>Anahtar kelimeler</h3><div className="seo-two"><label>Birincil odak anahtar kelime<input value={value.primaryKeyword} onChange={(e) => update({ primaryKeyword: e.target.value })} placeholder="Örn. operating partner framework" /></label><label>İkincil anahtar kelimeler<input value={value.secondaryKeywords} onChange={(e) => update({ secondaryKeywords: e.target.value })} placeholder="Virgülle ayırın" /></label></div><div className="seo-metrics"><span>İçerikte kullanım <b>{analysis.keyHits}</b></span><span>Yoğunluk <b>%{analysis.density}</b></span><span>Başlık/URL kontrolü <b>{analysis.checks.slice(1, 3).filter(x => x.ok).length}/2</b></span></div></section>

    <section className="seo-section"><h3>Arama görünümü</h3><div className="seo-two"><label>SEO başlığı<input value={props.seoTitle} onChange={(e) => props.onBasicChange({ seoTitle: e.target.value })} placeholder={props.title || "SEO başlığı"} /><small className={(props.seoTitle || props.title).length > 60 ? "limit-bad" : ""}>{(props.seoTitle || props.title).length}/60 karakter</small></label><label>Slug<input value={props.slug} onChange={(e) => props.onBasicChange({ slug: e.target.value })} /></label></div><label>Meta açıklama<textarea rows={3} value={props.seoDescription} onChange={(e) => props.onBasicChange({ seoDescription: e.target.value })} /><small className={props.seoDescription.length > 160 ? "limit-bad" : ""}>{props.seoDescription.length}/160 karakter</small></label><div className="seo-inline-actions"><button type="button" onClick={() => props.onBasicChange({ seoTitle: props.title.slice(0, 60), seoDescription: (props.excerpt || text(props.content).slice(0, 157)).slice(0, 160) })}>Başlık ve açıklamayı otomatik doldur</button><div className="seo-tabs"><button type="button" className={preview === "desktop" ? "active" : ""} onClick={() => setPreview("desktop")}>Masaüstü</button><button type="button" className={preview === "mobile" ? "active" : ""} onClick={() => setPreview("mobile")}>Mobil</button></div></div><div className={`serp-card ${preview}`}><span>{displayUrl}</span><h4>{displayTitle}</h4><p>{displayDescription}</p></div></section>

    <section className="seo-section"><h3>URL ve indeksleme</h3><label>Canonical URL<input type="url" value={value.canonicalUrl} onChange={(e) => update({ canonicalUrl: e.target.value })} placeholder="https://op8.com/yazilar/..." /></label><div className="seo-check-row"><label><input type="checkbox" checked={value.robotsIndex} onChange={(e) => update({ robotsIndex: e.target.checked })} /> index</label><label><input type="checkbox" checked={value.robotsFollow} onChange={(e) => update({ robotsFollow: e.target.checked })} /> follow</label><label><input type="checkbox" checked={value.redirectOldSlug} onChange={(e) => update({ redirectOldSlug: e.target.checked })} /> Slug değişiminde 301 yönlendirme uyarısı</label></div></section>

    <section className="seo-section"><h3>Sosyal medya görünümü</h3><div className="seo-two"><label>Open Graph başlığı<input value={value.ogTitle} onChange={(e) => update({ ogTitle: e.target.value })} placeholder={displayTitle} /></label><label>Paylaşım görseli URL<input value={value.ogImage} onChange={(e) => update({ ogImage: e.target.value })} placeholder={props.coverUrl || "1200 × 630 önerilir"} /></label></div><label>Open Graph açıklaması<textarea rows={2} value={value.ogDescription} onChange={(e) => update({ ogDescription: e.target.value })} placeholder={displayDescription} /></label><div className="seo-inline-actions"><select aria-label="X kart tipi" value={value.twitterCard} onChange={(e) => update({ twitterCard: e.target.value as SeoAdvanced["twitterCard"] })}><option value="summary_large_image">X büyük görsel kartı</option><option value="summary">X özet kartı</option></select><div className="seo-tabs"><button type="button" className={social === "linkedin" ? "active" : ""} onClick={() => setSocial("linkedin")}>LinkedIn</button><button type="button" className={social === "x" ? "active" : ""} onClick={() => setSocial("x")}>X</button></div></div><div className="social-card"><div className="social-image">{value.ogImage || props.coverUrl ? <img src={value.ogImage || props.coverUrl} alt="Sosyal medya önizlemesi" /> : <span>1200 × 630 paylaşım görseli</span>}</div><small>OP8.COM · {social.toUpperCase()}</small><h4>{value.ogTitle || displayTitle}</h4><p>{value.ogDescription || displayDescription}</p></div></section>

    <section className="seo-section"><h3>İçerik kalite analizi</h3><div className="seo-metrics grid"><span>Kelime <b>{analysis.words}</b></span><span>Okuma <b>{analysis.minutes} dk.</b></span><span>Alt başlık <b>{analysis.headings}</b></span><span>Okunabilirlik <b>{analysis.readability}/100</b></span><span>İç bağlantı <b>{analysis.internal}</b></span><span>Dış bağlantı <b>{analysis.external}</b></span></div><label className="seo-single-check"><input type="checkbox" checked={value.externalNofollow} onChange={(e) => update({ externalNofollow: e.target.checked })} /> Dış bağlantılarda varsayılan olarak nofollow kullan</label><div className="seo-suggestion">İlgili içerik önerisi: aynı kategori içindeki OP8 yazılarına en az iki iç bağlantı ekleyin. Kırık bağlantılar yayın öncesi sunucu kontrolünde ayrıca doğrulanır.</div></section>

    <section className="seo-section"><h3>Görsel SEO denetimi</h3><div className="seo-metrics grid"><span>İçerik görseli <b>{analysis.images}</b></span><span>Alt metinli <b>{analysis.imageAlts}</b></span><span>Kapak alt metni <b>{props.coverUrl ? (props.coverAlt ? "Tamam" : "Eksik") : "Görsel yok"}</b></span><span>Paylaşım görseli <b>{value.ogImage || props.coverUrl ? "Var" : "Eksik"}</b></span></div><p className="seo-help">Dosya boyutu, gerçek piksel ölçüsü ve kırık görsel adresi kayıt sırasında sunucu tarafında doğrulanacaktır.</p></section>

    <section className="seo-section"><h3>Yapısal veri</h3><div className="seo-two"><label>Şema türü<select value={value.schemaType} onChange={(e) => update({ schemaType: e.target.value as SeoAdvanced["schemaType"] })}><option>Article</option><option>BlogPosting</option><option>HowTo</option><option value="FAQPage">FAQ</option><option>NewsArticle</option></select></label><label className="seo-single-check"><input type="checkbox" checked={value.breadcrumb} onChange={(e) => update({ breadcrumb: e.target.checked })} /> Breadcrumb şeması ekle</label></div><details><summary>Schema JSON-LD önizlemesi</summary><pre>{JSON.stringify(schema, null, 2)}</pre></details></section>

    <section className="seo-section seo-checklist"><h3>Yayın öncesi SEO kontrol listesi</h3>{analysis.checks.map((item) => <div className={item.ok ? "pass" : item.critical ? "fail" : "warn"} key={item.label}><b>{item.ok ? "✓" : item.critical ? "!" : "•"}</b><span>{item.label}</span><small>{item.ok ? "Başarılı" : item.critical ? "Kritik" : "Öneri"}</small></div>)}{critical > 0 && <label>Editör geçersiz kılma gerekçesi<textarea rows={2} value={value.overrideReason} onChange={(e) => update({ overrideReason: e.target.value })} placeholder="Kritik uyarılara rağmen yayınlanacaksa gerekçe yazın." /></label>}<div className={`seo-ready ${critical === 0 ? "ready" : value.overrideReason.trim().length >= 10 ? "override" : "blocked"}`}>{critical === 0 ? "✓ SEO açısından hazır" : value.overrideReason.trim().length >= 10 ? "⚠ Editör gerekçesiyle yayınlanabilir" : "✕ Kritik sorunlar çözülmeden yayın önerilmez"}</div></section>
  </fieldset>;
}
