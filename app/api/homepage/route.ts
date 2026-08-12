Exit code: 0
Wall time: 2.4 seconds
Output:
import{eq}from"drizzle-orm";import{getDb}from"../../../db";import{homepageSettings}from"../../../db/schema";import{defaultHomeConfig}from"../../homepage-config";
export async function GET(){try{const[item]=await getDb().select().from(homepageSettings).where(eq(homepageSettings.id,1));return Response.json({item:item?JSON.parse(item.config):defaultHomeConfig})}catch{return Response.json({item:defaultHomeConfig})}}

