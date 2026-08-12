import { Actor, can, Permission } from "../admin-auth";

const links = [
  ["/admin", "Panel", "dashboard.view"],
  ["/admin/anasayfa", "Ana Sayfa", "homepage.manage"],
  ["/admin/ust-menu", "Üst Menü", "homepage.manage"],
  ["/admin/tema", "Renkler", "homepage.manage"],
  ["/admin/yazilar", "Yazılar", "posts.read"],
  ["/admin/kategoriler", "Kategoriler", "categories.manage"],
  ["/admin/etiketler", "Etiketler", "tags.manage"],
  ["/admin/medya", "Medya", "media.manage"],
  ["/admin/seo", "SEO", "seo.manage"],
  ["/admin/kullanicilar", "Kullanıcılar", "users.manage"],
] as const;

export function AdminNav({ active, actor }: { active: string; actor: Actor }) {
  return <>
    <style>{"body>.global-user-menu{display:none}"}</style>
    <header className="admin-header">
      <a className="brand" href="/" target="_top"><span>OP8</span> OP8 Operating Partner Value Creation Framework</a>
      <nav aria-label="Yönetim menüsü">
        {links.filter(([, , permission]) => can(actor, permission as Permission)).map(([href, label]) =>
          <a aria-current={active === href ? "page" : undefined} className={active === href ? "active" : undefined} href={href} key={href} target="_top">{label}</a>
        )}
        <a href="/" target="_top">Site</a>
      </nav>
    </header>
  </>;
}
