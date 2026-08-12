Exit code: 0
Wall time: 2.6 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import AdminModule from"../AdminModule";export const dynamic="force-dynamic";export default async function Users(){const actor=await requirePermission("users.manage","/admin/kullanicilar");return <main><AdminNav active="/admin/kullanicilar" actor={actor}/><AdminModule mode="users"/></main>}

