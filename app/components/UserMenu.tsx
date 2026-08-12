Exit code: 0
Wall time: 2.4 seconds
Output:

import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
export async function UserMenu(){const user=await getChatGPTUser();if(!user)return <a className="account-button" href={chatGPTSignInPath("/profil")}>Giriş yap</a>;const initial=user.displayName.trim().charAt(0).toLocaleUpperCase("tr-TR")||"Ü";return <a className="user-chip" href="/profil" aria-label="Profilini aç"><span className="user-avatar" aria-hidden="true">{initial}</span><span className="user-label"><strong>{user.fullName??"Profilim"}</strong><small>Hesabım</small></span></a>}

