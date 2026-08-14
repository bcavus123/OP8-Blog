"use client";

import { useEffect, useState } from "react";

const stages = [["idea", "Fikir"], ["draft", "Taslak"], ["review", "İnceleme"], ["approved", "Onaylandı"], ["scheduled", "Planlandı"], ["published", "Yayında"]] as const;
type Item = { id: number; title: string; status: string };

export default function EditorialWorkflow() {
  const [items, setItems] = useState<Item[]>([]);
  const [allowed, setAllowed] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/posts");
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Editoryal akış yüklenemedi."); return; }
    setItems(data.posts || []);
    setAllowed(data.capabilities?.allowedStatuses || []);
  }
  useEffect(() => { load(); }, []);

  async function move(id: number, status: string) {
    if (status === "scheduled") {
      setMessage("Planlama tarihi içerik düzenleme ekranından seçilmelidir.");
      return;
    }
    const response = await fetch("/api/admin/posts", {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Aşama değiştirilemedi."); return; }
    setMessage(`İçerik “${stages.find(([value]) => value === status)?.[1]}” aşamasına taşındı.`);
    await load();
  }

  return <section className="editorial-workflow-admin">
    <header><div><h2>Editoryal iş akışı</h2><p>Rolünüze açık aşamalar arasında içerikleri ilerletin.</p></div>{message && <span role="status">{message}</span>}</header>
    <div className="editorial-stage-counts">{stages.map(([value, label]) => <span key={value}><b>{items.filter((item) => item.status === value).length}</b>{label}</span>)}</div>
    <div className="editorial-workflow-list">{items.map((item) => <label key={item.id}><span>{item.title}</span><select value={item.status} onChange={(event) => move(item.id, event.target.value)}>{!allowed.includes(item.status) && <option value={item.status}>{stages.find(([value]) => value === item.status)?.[1] || item.status}</option>}{stages.filter(([value]) => allowed.includes(value)).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>)}</div>
  </section>;
}
