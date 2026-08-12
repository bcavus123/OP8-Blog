import Link from "next/link";
import { and, eq, isNotNull, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { categories, posts } from "../../../db/schema";

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const now=new Date().toISOString().slice(0,19).replace("T"," ");
  let post:null|{title:string;excerpt:string;content:string;categoryName:string|null;coverUrl:string;coverAlt:string;publishedAt:string|null}=null;
  try{
    [post]=await getDb().select({title:posts.title,excerpt:posts.excerpt,content:posts.content,categoryName:categories.name,coverUrl:posts.coverUrl,coverAlt:posts.coverAlt,publishedAt:posts.publishedAt}).from(posts).leftJoin(categories,eq(posts.categoryId,categories.id)).where(and(eq(posts.slug,slug),eq(posts.status,"published"),isNotNull(posts.publishedAt),lte(posts.publishedAt,now))).limit(1);
  }catch{}
  if(!post)return <main><article className="article shell"><Link className="back" href="/">← Ana sayfa</Link><h1>Yazı bulunamadı</h1><p>Bu yazı kaldırılmış veya henüz yayımlanmamış olabilir.</p></article></main>;
  const paragraphs=post.content.split(/\n{2,}/).map(value=>value.trim()).filter(Boolean);
  return <main><header className="site-header shell"><Link className="brand" href="/"><span>OP8</span> OP8 Operating Partner Value Creation Framework</Link><nav><Link href="/#yazilar">Yazılar</Link><Link href="/#konular">Konular</Link><Link href="/#hakkinda">Hakkında</Link></nav></header><article className="article shell"><Link className="back" href="/">← Tüm yazılar</Link><p className="kicker">{post.categoryName||"GENEL"}</p><h1>{post.title}</h1><p className="article-deck">{post.excerpt}</p>{post.publishedAt&&<div className="meta"><span>{new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(post.publishedAt.replace(" ","T")+"Z"))}</span></div>}{post.coverUrl&&<img className="article-cover" src={post.coverUrl} alt={post.coverAlt}/>}<div className="article-rule"/><div className="article-body"><div>{paragraphs.map((paragraph,index)=><p className={index===0?"lead":undefined} key={index}>{paragraph}</p>)}</div></div></article></main>
}
