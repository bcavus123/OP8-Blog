Exit code: 0
Wall time: 2.6 seconds
Output:
import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { getDb } from "../db";
import { categories, homepageSettings, posts } from "../db/schema";
import HomePageClient from "./HomePageClient";
import { defaultHomeConfig, normalizeHomeConfig } from "./homepage-config";

export const dynamic="force-dynamic";

export default async function Home(){
  let config=defaultHomeConfig;
  let published:Awaited<ReturnType<typeof loadPosts>>=[];
  let topics:{id:number;name:string;slug:string;postCount:number}[]=[];
  try{
    const db=getDb();
    const[setting]=await db.select().from(homepageSettings).where(eq(homepageSettings.id,1));
    if(setting?.config)config=normalizeHomeConfig(JSON.parse(setting.config));
    published=await loadPosts();
    const rows=await db.select({id:categories.id,name:categories.name,slug:categories.slug}).from(categories).orderBy(asc(categories.sortOrder),asc(categories.name));
    const counts=new Map<number,number>();
    for(const post of published)if(post.categoryId)counts.set(post.categoryId,(counts.get(post.categoryId)??0)+1);
    topics=rows.map(row=>({...row,postCount:counts.get(row.id)??0})).filter(row=>row.postCount>0);
  }catch{}
  return <HomePageClient initialConfig={config} initialPosts={published} initialTopics={topics}/>;
}

async function loadPosts(){
  const now=new Date().toISOString().slice(0,19).replace("T"," ");
  return getDb().select({id:posts.id,title:posts.title,slug:posts.slug,excerpt:posts.excerpt,categoryId:posts.categoryId,categoryName:categories.name,coverUrl:posts.coverUrl,coverAlt:posts.coverAlt,publishedAt:posts.publishedAt}).from(posts).leftJoin(categories,eq(posts.categoryId,categories.id)).where(and(eq(posts.status,"published"),isNotNull(posts.publishedAt),lte(posts.publishedAt,now))).orderBy(desc(posts.publishedAt),desc(posts.id));
}

