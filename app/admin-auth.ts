Exit code: 0
Wall time: 2 seconds
Output:
import{headers}from"next/headers";
import{redirect}from"next/navigation";
import{getCurrentUser,SiteUser}from"./user-auth";
import{Permission,Role,roleCan,roleLabels}from"./permissions";export type{Permission,Role};
export type Actor=SiteUser&{role:Role;bootstrap?:boolean};
export function can(actor:Actor|null,permission:Permission){return Boolean(actor&&roleCan(actor.role,permission))}
async function basicActor():Promise<Actor|null>{const value=(await headers()).get("authorization");if(!value?.startsWith("Basic ")||!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD)return null;try{const decoded=Buffer.from(value.slice(6),"base64").toString("utf8"),at=decoded.indexOf(":");if(decoded.slice(0,at)===process.env.ADMIN_EMAIL&&decoded.slice(at+1)===process.env.ADMIN_PASSWORD)return{userId:"bootstrap",email:process.env.ADMIN_EMAIL,displayName:"Süper Yönetici",fullName:"Süper Yönetici",role:"super_admin",status:"active",bootstrap:true}}catch{return null}return null}
export async function getActor():Promise<Actor|null>{const user=await getCurrentUser();if(user)return{...user,role:(user.role||"member")as Role};return basicActor()}
export async function requirePermission(permission:Permission,returnTo:string){const actor=await getActor();if(!actor)redirect(`/giris?return_to=${encodeURIComponent(returnTo)}`);if(!can(actor,permission))redirect(actor.role==="member"?"/profil":"/admin/yazilar");return actor}
export async function apiPermission(permission:Permission){const actor=await getActor();if(!actor)return{error:Response.json({error:"Oturum açmanız gerekiyor."},{status:401})};if(!can(actor,permission))return{error:Response.json({error:"Bu işlem için yetkiniz yok."},{status:403})};return{actor}}
export{roleLabels};

