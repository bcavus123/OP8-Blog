Exit code: 0
Wall time: 2.6 seconds
Output:
import{requirePermission}from"../admin-auth";import{AdminNav}from"./AdminNav";import AdminModule from"./AdminModule";export const dynamic="force-dynamic";export default async function Admin(){const actor=await requirePermission("dashboard.view","/admin");return <main><AdminNav active="/admin" actor={actor}/><AdminModule mode="dashboard"/></main>}

