import { Actor, can, Permission, roleLabels } from "../admin-auth";
type NavItem={href:string;label:string;icon:string;permission:Permission};
const links:NavItem[]=[
 {href:"/admin",label:"Ana Panel",icon:"▤",permission:"dashboard.view"},
 {href:"/admin/yazilar",label:"İçerik",icon:"▧",permission:"posts.read"},
 {href:"/admin/framework",label:"Framework",icon:"⌘",permission:"framework.manage"},
 {href:"/admin/anasayfa",label:"Ana Sayfa Tasarımı",icon:"⌘",permission:"homepage.manage"},
 {href:"/admin/kategoriler",label:"Kategoriler",icon:"▦",permission:"categories.manage"},
 {href:"/admin/etiketler",label:"Etiketler",icon:"◇",permission:"tags.manage"},
 {href:"/admin/research",label:"Araştırma",icon:"⌕",permission:"research.manage"},
 {href:"/admin/medya",label:"Medya",icon:"▧",permission:"media.manage"},
 {href:"/admin/seo",label:"SEO",icon:"⌕",permission:"seo.manage"},
 {href:"/admin/analytics",label:"Analitik Raporları",icon:"▥",permission:"analytics.read"},
 {href:"/admin/crm",label:"Leads & CRM",icon:"⌘",permission:"crm.manage"},
 {href:"/admin/kullanicilar",label:"Kullanıcılar",icon:"♙",permission:"users.manage"},
 {href:"/admin/ayarlar",label:"Ayarlar",icon:"⚙",permission:"settings.manage"},
];
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0]).join("").toLocaleUpperCase("tr-TR")||"OP"}
export function AdminNav({active,actor}:{active:string;actor:Actor}){const visible=links.filter(item=>can(actor,item.permission)),displayName=actor.displayName||actor.fullName||actor.email;return <><style>{"body>.global-user-menu{display:none}"}</style><aside className="op8-sidebar"><a className="op8-admin-logo" href="/" target="_top" aria-label="OP8 ana sayfa"><strong>OP8<sup>™</sup></strong><span>ADMIN</span></a><nav aria-label="Yönetim menüsü">{visible.map(item=>{const selected=active===item.href||(item.href!=="/admin"&&active.startsWith(`${item.href}/`));return <a aria-current={selected?"page":undefined} className={selected?"active":undefined} href={item.href} key={item.href} target="_top"><span className="op8-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></a>})}</nav><a className="op8-framework-card" href="/admin/anasayfa" target="_top"><span className="op8-framework-mark">◉</span><span><strong>OP8™ Framework</strong><small>8 Değer Motoru</small></span></a><div className="op8-sidebar-user"><span className="op8-avatar">{initials(displayName)}</span><span><strong>{displayName}</strong><small>{roleLabels[actor.role]}</small></span><span aria-hidden="true">⌄</span></div></aside></>}
