const links = [
  ["/admin", "Panel"],
  ["/admin/anasayfa", "Ana Sayfa"],
  ["/admin/ust-menu", "Üst Menü"],
  ["/admin/tema", "Renkler"],
  ["/admin/yazilar", "Yazılar"],
  ["/admin/kategoriler", "Kategoriler"],
  ["/admin/etiketler", "Etiketler"],
  ["/admin/medya", "Medya"],
  ["/admin/seo", "SEO"],
  ["/admin/kullanicilar", "Kullanıcılar"],
] as const;

export function AdminNav({ active }: { active: string }) {
  return (
    <>
    <style>{"body>.global-user-menu{display:none}"}</style>
    <header className="admin-header">
      <a className="brand" href="/">
        <span>OP8</span> OP8 Operating Partner Value Creation Framework
      </a>
      <nav aria-label="Yönetim menüsü">
        {links.map(([href, label]) => (
          <a
            aria-current={active === href ? "page" : undefined}
            className={active === href ? "active" : undefined}
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
        <a href="/">Site</a>
      </nav>
    </header>
    </>
  );
}
