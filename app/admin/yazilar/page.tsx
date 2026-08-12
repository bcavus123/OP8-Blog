import {requirePermission} from "../../admin-auth";
import {AdminNav} from "../AdminNav";
import PostManager from "./PostManagerRich";
export const dynamic="force-dynamic";
export default async function PostsAdmin(){const actor=await requirePermission("posts.read","/admin/yazilar");return <main><AdminNav active="/admin/yazilar" actor={actor}/><PostManager/></main>}
