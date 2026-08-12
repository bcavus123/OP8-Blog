Exit code: 0
Wall time: 2.7 seconds
Output:
import{requirePermission}from"../../admin-auth";import{AdminNav}from"../AdminNav";import CategoryManager from"./CategoryManager";export const dynamic="force-dynamic";export default async function CategoriesAdmin(){const actor=await requirePermission("categories.manage","/admin/kategoriler");return <main><AdminNav active="/admin/kategoriler" actor={actor}/><CategoryManager/></main>}

