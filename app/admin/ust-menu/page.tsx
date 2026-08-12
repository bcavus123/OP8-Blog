Exit code: 0
Wall time: 2.6 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import HeaderMenuManager from"./HeaderMenuManager";import"../designer.css";import"../designer-extra.css";export const dynamic="force-dynamic";export default async function HeaderMenuPage(){const actor=await requirePermission("homepage.manage","/admin/ust-menu");return <main><AdminNav active="/admin/ust-menu" actor={actor}/><HeaderMenuManager/></main>}

