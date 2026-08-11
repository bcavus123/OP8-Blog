import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getPool } from "../db";
const COOKIE_NAME="op8_session";
export type SiteUser={userId:string;email:string;displayName:string;fullName:string};
export function hashPassword(password:string){const salt=randomBytes(16).toString("hex");return `${salt}:${scryptSync(password,salt,64).toString("hex")}`}
export function verifyPassword(password:string,encoded:string){const[salt,stored]=encoded.split(":");if(!salt||!stored)return false;const actual=scryptSync(password,salt,64);const expected=Buffer.from(stored,"hex");return expected.length===actual.length&&timingSafeEqual(expected,actual)}
const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
export async function createUserSession(userId:number){const token=randomBytes(32).toString("base64url");const expires=new Date(Date.now()+30*86400000);await getPool().execute("INSERT INTO user_sessions(user_id,token_hash,expires_at) VALUES(?,?,?)",[userId,digest(token),expires]);(await cookies()).set(COOKIE_NAME,token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",expires})}
export async function getCurrentUser():Promise<SiteUser|null>{const token=(await cookies()).get(COOKIE_NAME)?.value;if(!token)return null;const[rows]=await getPool().execute<any[]>("SELECT u.id,u.email,u.display_name FROM user_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() AND u.status='active' LIMIT 1",[digest(token)]);const user=rows[0];return user?{userId:String(user.id),email:user.email,displayName:user.display_name,fullName:user.display_name}:null}
export async function destroyUserSession(){const jar=await cookies();const token=jar.get(COOKIE_NAME)?.value;if(token)await getPool().execute("DELETE FROM user_sessions WHERE token_hash=?",[digest(token)]);jar.delete(COOKIE_NAME)}
