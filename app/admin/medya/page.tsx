Exit code: 0
Wall time: 2.7 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import AdminModule from"../AdminModule";export const dynamic="force-dynamic";export default async function Media(){const actor=await requirePermission("media.manage","/admin/medya");return <main><AdminNav active="/admin/medya" actor={actor}/><AdminModule mode="media"/></main>}

