import { requirePermission } from "../../admin-auth";
import { AdminNav } from "../AdminNav";
import UserManager from "./UserManager";
import "./users.css";

export const dynamic="force-dynamic";
export default async function Users(){
  const actor=await requirePermission("users.manage","/admin/kullanicilar");
  return <main><AdminNav active="/admin/kullanicilar" actor={actor}/><UserManager/></main>
}
