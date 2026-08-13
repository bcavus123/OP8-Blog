import { requirePermission } from "../admin-auth";
import { AdminNav } from "./AdminNav";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const actor = await requirePermission("dashboard.view", "/admin");
  return <main>
    <AdminNav active="/admin" actor={actor} />
    <AdminDashboard displayName={actor.displayName || actor.fullName || "OP8 Admin"} />
  </main>;
}
