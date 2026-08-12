Exit code: 0
Wall time: 2.8 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import AdminModule from"../AdminModule";export const dynamic="force-dynamic";export default async function Tags(){const actor=await requirePermission("tags.manage","/admin/etiketler");return <main><AdminNav active="/admin/etiketler" actor={actor}/><AdminModule mode="tags"/></main>}

