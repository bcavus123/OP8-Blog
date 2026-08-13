import { AdminNav } from "../admin/AdminNav";
import AdminDashboard from "../admin/AdminDashboard";

export default function DashboardPreview() {
  const actor = { userId: "preview", email: "preview@op8.local", displayName: "OP8 Admin", fullName: "OP8 Admin", role: "super_admin" as const, status: "active" };
  const previewData = {
    stats: { posts: 142, categories: 8, media: 56, users: 12 },
    recent: [
      { id: 1, title: "OP8 Framework Nedir?", status: "published", updatedAt: "2026-08-12T14:00:00Z" },
      { id: 2, title: "8 Değer Motoru", status: "draft", updatedAt: "2026-08-12T11:00:00Z" },
      { id: 3, title: "EBITDA Nasıl Geliştirilir?", status: "published", updatedAt: "2026-08-11T09:00:00Z" },
      { id: 4, title: "Operating Partner Rolü", status: "scheduled", updatedAt: "2026-08-10T08:00:00Z" },
    ],
    analytics: [
      { date: "2026-08-06", views: 3100, visitors: 740 }, { date: "2026-08-07", views: 3420, visitors: 810 },
      { date: "2026-08-08", views: 3290, visitors: 790 }, { date: "2026-08-09", views: 3810, visitors: 920 },
      { date: "2026-08-10", views: 4050, visitors: 1010 }, { date: "2026-08-11", views: 4330, visitors: 1080 },
      { date: "2026-08-12", views: 4442, visitors: 1122 },
    ],
  };
  return <main><AdminNav active="/admin" actor={actor} /><AdminDashboard displayName="OP8 Admin" initialData={previewData} /></main>;
}
