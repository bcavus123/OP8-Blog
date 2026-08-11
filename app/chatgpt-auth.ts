import{redirect}from"next/navigation";import{getCurrentUser,type SiteUser}from"./user-auth";
export type ChatGPTUser=SiteUser;export const getChatGPTUser=getCurrentUser;
export async function requireChatGPTUser(returnTo:string){const user=await getCurrentUser();if(user)return user;redirect(chatGPTSignInPath(returnTo))}
export function chatGPTSignInPath(returnTo:string){return `/giris?return_to=${encodeURIComponent(safe(returnTo))}`}
export function chatGPTSignOutPath(returnTo="/"){return `/api/auth/logout?return_to=${encodeURIComponent(safe(returnTo))}`}
function safe(value:string){return value.startsWith("/")&&!value.startsWith("//")?value:"/"}
