Exit code: 0
Wall time: 2.6 seconds
Output:
export type Role="super_admin"|"admin"|"editor"|"author"|"member"|"guest";
export type Permission="admin.access"|"dashboard.view"|"posts.read"|"posts.write"|"posts.publish"|"posts.delete"|"categories.manage"|"tags.manage"|"media.manage"|"homepage.manage"|"seo.manage"|"users.manage";
export const permissionMatrix:Record<Role,readonly string[]>={super_admin:["*"],admin:["admin.access","dashboard.view","posts.read","posts.write","posts.publish","posts.delete","categories.manage","tags.manage","media.manage","homepage.manage","seo.manage"],editor:["admin.access","dashboard.view","posts.read","posts.write","posts.publish","posts.delete"],author:["admin.access","posts.read","posts.write"],member:[],guest:[]};
export function roleCan(role:Role,permission:Permission){const allowed=permissionMatrix[role];return allowed.includes("*")||allowed.includes(permission)}
export const roleLabels:Record<Role,string>={super_admin:"Süper Yönetici",admin:"Yönetici",editor:"Editör",author:"Yazar",member:"Site Üyesi",guest:"Misafir"};

