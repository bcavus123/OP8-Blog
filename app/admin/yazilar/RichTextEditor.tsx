"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MediaItem = { id: number; name: string; url: string; alt: string; mimeType: string };
const fonts = ["Arial", "Georgia", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman"];
const sizes = [12, 14, 16, 18, 20, 24, 32, 40, 48];
const htmlValue = (value: string) => /<[a-z][\s\S]*>/i.test(value) ? value : value.split(/\n{2,}/).filter(Boolean).map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("");
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const selection = useRef<Range | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showMedia, setShowMedia] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);

  useEffect(() => { if (!sourceMode && editor.current && editor.current.innerHTML !== htmlValue(value)) editor.current.innerHTML = htmlValue(value); setHtmlSource(value); }, [value, sourceMode]);
  useEffect(() => { fetch("/api/admin/modules?module=media").then((response) => response.ok ? response.json() : { items: [] }).then((data) => setMedia((data.items || []).filter((item: MediaItem) => item.mimeType?.startsWith("image/")))).catch(() => undefined); }, []);

  const text = useMemo(() => htmlValue(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(), [value]);
  const words = text ? text.split(" ").length : 0;
  const characters = text.length;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));
  const sync = () => onChange(editor.current?.innerHTML || "");
  const rememberSelection = () => { const current = window.getSelection(); if (current?.rangeCount && editor.current?.contains(current.anchorNode)) selection.current = current.getRangeAt(0).cloneRange(); };
  const restoreSelection = () => { editor.current?.focus(); if (selection.current) { const current = window.getSelection(); current?.removeAllRanges(); current?.addRange(selection.current); } };
  const command = (name: string, argument?: string) => { restoreSelection(); document.execCommand(name, false, argument); rememberSelection(); sync(); };
  const insertHtml = (html: string) => command("insertHTML", html);
  const applyPx = (pixels: string) => { command("fontSize", "7"); editor.current?.querySelectorAll('font[size="7"]').forEach((node) => { const span = document.createElement("span"); span.style.fontSize = `${pixels}px`; span.innerHTML = node.innerHTML; node.replaceWith(span); }); sync(); };

  function insertImage(url: string, alt = "") { const caption = prompt("Görsel açıklaması", alt) || ""; const width = Math.max(10, Math.min(100, Number(prompt("Görsel genişliği (%)", "100")) || 100)); restoreSelection(); insertHtml(`<figure style="width:${width}%"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(caption)}</figcaption></figure><p><br></p>`); setShowMedia(false); }
  function addLink() { rememberSelection(); const url = prompt("Bağlantı adresi (https://…)"); if (url) command("createLink", url); }
  function addImageUrl() { rememberSelection(); const url = prompt("Görsel adresi (/api/media/... veya https://…)"); if (url) insertImage(url, prompt("Görsel alt metni", "") || ""); }
  function addTable() { rememberSelection(); const rows = Math.max(1, Math.min(20, Number(prompt("Satır sayısı", "3")) || 3)); const columns = Math.max(1, Math.min(10, Number(prompt("Sütun sayısı", "3")) || 3)); const header = `<tr>${Array.from({ length: columns }, (_, index) => `<th>Sütun ${index + 1}</th>`).join("")}</tr>`; const body = Array.from({ length: rows }, () => `<tr>${Array.from({ length: columns }, () => "<td>İçerik</td>").join("")}</tr>`).join(""); insertHtml(`<table><thead>${header}</thead><tbody>${body}</tbody></table><p><br></p>`); }
  function toggleSource() { if (sourceMode) { onChange(htmlSource); setSourceMode(false); } else { setHtmlSource(editor.current?.innerHTML || value); setSourceMode(true); } }
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) { event.preventDefault(); const html = event.clipboardData.getData("text/html"); const plain = event.clipboardData.getData("text/plain"); document.execCommand("insertHTML", false, html || escapeHtml(plain).replace(/\n/g, "<br>")); sync(); }

  return <div className={`rich-editor-wrap word-editor ${fullscreen ? "is-fullscreen" : ""}`}>
    <div className="word-ribbon" role="toolbar" aria-label="İçerik biçimlendirme araçları" onMouseDown={(event) => { if ((event.target as HTMLElement).closest("button")) event.preventDefault(); }}>
      <div className="ribbon-group"><span className="ribbon-label">Stil</span><select aria-label="Paragraf biçimi" defaultValue="p" onChange={(event) => command("formatBlock", event.target.value)}><option value="p">Normal metin</option><option value="h2">Başlık 2</option><option value="h3">Başlık 3</option><option value="h4">Başlık 4</option><option value="blockquote">Alıntı</option></select></div>
      <div className="ribbon-group font-group"><span className="ribbon-label">Yazı</span><select aria-label="Yazı tipi" defaultValue="Arial" onChange={(event) => command("fontName", event.target.value)}>{fonts.map((font) => <option key={font}>{font}</option>)}</select><select aria-label="Yazı boyutu" defaultValue="16" onChange={(event) => applyPx(event.target.value)}>{sizes.map((size) => <option value={size} key={size}>{size}</option>)}</select><button type="button" onClick={() => command("bold")} title="Kalın"><b>K</b></button><button type="button" onClick={() => command("italic")} title="İtalik"><i>İ</i></button><button type="button" onClick={() => command("underline")} title="Altı çizili"><u>A</u></button><button type="button" onClick={() => command("strikeThrough")} title="Üstü çizili"><s>A</s></button><label className="toolbar-color" title="Yazı rengi"><span>A</span><input aria-label="Yazı rengi" type="color" defaultValue="#17233c" onChange={(event) => command("foreColor", event.target.value)} /></label><label className="toolbar-color highlight" title="Vurgu rengi"><span>▰</span><input aria-label="Vurgu rengi" type="color" defaultValue="#fff2a8" onChange={(event) => command("hiliteColor", event.target.value)} /></label></div>
      <div className="ribbon-group"><span className="ribbon-label">Paragraf</span><button type="button" onClick={() => command("justifyLeft")} title="Sola hizala">☰</button><button type="button" onClick={() => command("justifyCenter")} title="Ortala">≡</button><button type="button" onClick={() => command("justifyRight")} title="Sağa hizala">☷</button><button type="button" onClick={() => command("justifyFull")} title="İki yana yasla">▤</button><button type="button" onClick={() => command("insertUnorderedList")}>• Liste</button><button type="button" onClick={() => command("insertOrderedList")}>1. Liste</button><button type="button" onClick={() => command("outdent")} title="Girintiyi azalt">⇤</button><button type="button" onClick={() => command("indent")} title="Girintiyi artır">⇥</button></div>
      <div className="ribbon-group"><span className="ribbon-label">Ekle</span><button type="button" onClick={addLink}>🔗 Bağlantı</button><button type="button" onClick={() => setShowMedia(!showMedia)}>▧ Medya</button><button type="button" onClick={addImageUrl}>▧ Görsel URL</button><button type="button" onClick={addTable}>▦ Tablo</button><button type="button" onClick={() => insertHtml("<hr><p><br></p>")}>— Ayraç</button></div>
      <div className="ribbon-group"><span className="ribbon-label">Araçlar</span><button type="button" onClick={() => command("removeFormat")}>Biçimi temizle</button><button type="button" onClick={() => command("undo")}>↶ Geri</button><button type="button" onClick={() => command("redo")}>↷ İleri</button><button type="button" className={sourceMode ? "active" : ""} onClick={toggleSource}>{sourceMode ? "Görsel" : "HTML"}</button><button type="button" className={fullscreen ? "active" : ""} onClick={() => setFullscreen(!fullscreen)}>{fullscreen ? "Küçült" : "Tam ekran"}</button></div>
    </div>
    {showMedia && <div className="inline-media-picker">{media.length ? media.map((item) => <button type="button" onClick={() => insertImage(item.url, item.alt || item.name)} key={item.id}><img src={item.url} alt={item.alt || item.name} /><span>{item.name}</span></button>) : <p>Medya kütüphanesinde kullanılabilir görsel yok. “Görsel URL” seçeneğini kullanabilirsiniz.</p>}</div>}
    {sourceMode ? <textarea className="rich-source" value={htmlSource} onChange={(event) => setHtmlSource(event.target.value)} aria-label="HTML kaynak kodu" /> : <div ref={editor} className="rich-editor" contentEditable suppressContentEditableWarning onInput={sync} onBlur={() => { rememberSelection(); sync(); }} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onPaste={handlePaste} data-placeholder="Yazınızı buraya yazın…" />}
    <footer className="word-status"><span>{words} kelime</span><span>{characters} karakter</span><span>Yaklaşık {readingMinutes} dk okuma</span><span className="autosave-state">● Değişiklikler forma aktarılıyor</span></footer>
  </div>;
}
