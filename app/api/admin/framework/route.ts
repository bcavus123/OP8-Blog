import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { frameworkAreas } from "../../../../db/schema";
import { apiPermission } from "../../../admin-auth";
const engines=["Growth","Sales","Delivery","Operations","People","Profitability","Portfolio","Customer Success"];
const seeds=[
 ["Market & Customer Insight","Growth",3,100,"published",0],["Growth Strategy","Growth",3,80,"published",1],["Demand Generation","Growth",4,72,"published",1],
 ["Sales Strategy & Planning","Sales",3,100,"published",0],["Pipeline Management","Sales",4,75,"draft",1],["Pricing & Value","Sales",4,68,"review",1],
 ["Solution Delivery Model","Delivery",3,60,"review",1],["Project Economics","Delivery",4,64,"published",1],["Resource Management","Delivery",4,54,"draft",1],
 ["Operational Excellence","Operations",3,92,"published",0],["Process Optimization","Operations",4,86,"published",0],["Automation & Tools","Operations",5,82,"published",1],
 ["Leadership","People",3,82,"published",0],["Talent & Capability","People",4,70,"review",1],["Culture & Engagement","People",4,67,"draft",1],
 ["EBITDA Improvement","Profitability",3,96,"published",0],["Cost Optimization","Profitability",4,90,"published",0],["Margin Expansion","Profitability",4,84,"published",1],
 ["Portfolio Strategy","Portfolio",3,62,"draft",1],["Value Driver Tree","Portfolio",4,54,"review",1],["Transformation Roadmap","Portfolio",4,40,"draft",1],
 ["Customer Success Strategy","Customer Success",3,52,"review",1],["Retention & Expansion","Customer Success",4,44,"draft",1],["Voice of Customer","Customer Success",4,42,"draft",1]
] as const;
async function auth(){return apiPermission("framework.manage")}
async function seed(){const db=getDb(),[{count}]=await db.select({count:sql<number>`count(*)`}).from(frameworkAreas);if(Number(count))return;await db.insert(frameworkAreas).values(seeds.map(([name,engine,level,coverage,status,contentNeed])=>({name,description:`${engine} değer motoru için ${name} yetkinlik alanı.`,engine,level,coverage,status,contentNeed})))}
export async function GET(){const a=await auth();if(a.error)return a.error;try{await seed();return Response.json({items:await getDb().select().from(frameworkAreas).orderBy(asc(frameworkAreas.engine),asc(frameworkAreas.level),asc(frameworkAreas.name)),engines})}catch{return Response.json({items:[],engines,setupRequired:true})}}
export async function POST(request:Request){const a=await auth();if(a.error)return a.error;const data=await request.json(),values=validate(data);if(!values)return Response.json({error:"Ad, değer motoru ve geçerli seviye zorunludur."},{status:400});const ids=await getDb().insert(frameworkAreas).values(values).$returningId();return Response.json({id:ids[0].id},{status:201})}
export async function PUT(request:Request){const a=await auth();if(a.error)return a.error;const data=await request.json(),id=Number(data.id),values=validate(data);if(!id||!values)return Response.json({error:"Geçersiz framework alanı."},{status:400});await getDb().update(frameworkAreas).set(values).where(eq(frameworkAreas.id,id));return Response.json({ok:true})}
export async function PATCH(request:Request){const a=await auth();if(a.error)return a.error;const data=await request.json(),id=Number(data.id);if(!id)return Response.json({error:"Alan bulunamadı."},{status:400});await getDb().update(frameworkAreas).set({status:String(data.status||"draft")}).where(eq(frameworkAreas.id,id));return Response.json({ok:true})}
export async function DELETE(request:Request){const a=await auth();if(a.error)return a.error;const{id}=await request.json();await getDb().delete(frameworkAreas).where(eq(frameworkAreas.id,Number(id)));return Response.json({ok:true})}
function validate(data:Record<string,unknown>){const name=String(data.name||"").trim(),engine=String(data.engine||""),level=Math.min(5,Math.max(1,Number(data.level)||3)),coverage=Math.min(100,Math.max(0,Number(data.coverage)||0)),status=String(data.status||"draft");if(!name||!engines.includes(engine))return null;return{name,description:String(data.description||""),engine,level,coverage,status,contentNeed:data.contentNeed?1:0}}
