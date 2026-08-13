import { requirePermission } from "../../admin-auth";
import { AdminNav } from "../AdminNav";
import AnalyticsOverview from "./AnalyticsOverview";
import "./analytics.css";
import "./analytics-live.css";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const actor = await requirePermission("analytics.read", "/admin/analytics");
  return <main><AdminNav active="/admin/analytics" actor={actor} /><AnalyticsOverview /></main>;
}
