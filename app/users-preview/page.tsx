import { notFound } from "next/navigation";
import { AdminNav } from "../admin/AdminNav";
import UserManager from "../admin/kullanicilar/UserManager";
import "../admin/kullanicilar/users.css";

export const dynamic="force-dynamic";

export default function UsersPreview(){
  if(process.env.LOCAL_TEST_MODE!=="1") notFound();
  const actor={
    userId:"preview",
    email:"preview@op8.local",
    displayName:"OP8 Admin",
    fullName:"OP8 Admin",
    role:"super_admin" as const,
    status:"active",
  };
  return <main><AdminNav active="/admin/kullanicilar" actor={actor}/><UserManager preview/></main>
}
