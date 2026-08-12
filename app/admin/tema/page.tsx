Exit code: 0
Wall time: 2.8 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import ThemeManager from"./ThemeManager";import"../designer.css";import"../designer-extra.css";import"./theme.css";export const dynamic="force-dynamic";export default async function ThemePage(){const actor=await requirePermission("homepage.manage","/admin/tema");return <main><AdminNav active="/admin/tema" actor={actor}/><ThemeManager/></main>}

