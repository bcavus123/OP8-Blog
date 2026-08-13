import { AdminNav } from "../admin/AdminNav";
import AnalyticsOverview from "../admin/analytics/AnalyticsOverview";
import "../admin/admin-dashboard.css";
import "../admin/analytics/analytics.css";
import "../admin/analytics/analytics-live.css";

export default function AnalyticsPreviewPage() {
  const actor = {
    userId: "preview",
    email: "preview@op8.local",
    displayName: "OP8 Admin",
    fullName: "OP8 Admin",
    role: "super_admin" as const,
    status: "active",
  };
  return <main><AdminNav active="/admin/analytics" actor={actor} /><AnalyticsOverview /></main>;
}
