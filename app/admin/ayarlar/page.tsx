import { requirePermission } from "../../admin-auth";
import { AdminNav } from "../AdminNav";
import SettingsManager from "../tema/SettingsManager";
import "../tema/settings.css";
import "../tema/settings-advanced.css";
export const dynamic="force-dynamic";
export default async function SettingsPage(){const actor=await requirePermission("settings.manage","/admin/ayarlar");return <main><AdminNav active="/admin/ayarlar" actor={actor}/><SettingsManager/></main>}
