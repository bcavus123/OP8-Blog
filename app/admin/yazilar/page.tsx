import {requirePermission} from "../../admin-auth";
import {AdminNav} from "../AdminNav";
import PostManager from "./PostManagerRich";
import EditorialWorkflow from "./EditorialWorkflow";
import "./content.css";
import "./word-editor.css";
import "./word-editor-layout.css";
import "./advanced-seo.css";
export const dynamic="force-dynamic";
export default async function PostsAdmin(){const actor=await requirePermission("posts.read","/admin/yazilar");return <main><AdminNav active="/admin/yazilar" actor={actor}/><EditorialWorkflow/><PostManager/></main>}
