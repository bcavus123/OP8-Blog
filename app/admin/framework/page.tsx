import { requirePermission } from "../../admin-auth";
import { AdminNav } from "../AdminNav";
import FrameworkManager from "./FrameworkManager";
import "./framework.css";
export const dynamic="force-dynamic";
export default async function FrameworkPage(){const actor=await requirePermission("framework.manage","/admin/framework");return <main className="framework-shell"><AdminNav active="/admin/framework" actor={actor}/><FrameworkManager/></main>}
