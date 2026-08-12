Exit code: 0
Wall time: 2.6 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import PostManager from"./PostManager";export const dynamic="force-dynamic";export default async function PostsAdmin(){const actor=await requirePermission("posts.read","/admin/yazilar");return <main><AdminNav active="/admin/yazilar" actor={actor}/><PostManager/></main>}

