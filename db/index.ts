Exit code: 0
Wall time: 2.3 seconds
Output:
import mysql from"mysql2/promise";import{drizzle}from"drizzle-orm/mysql2";import*as schema from"./schema";
const globalDb=globalThis as unknown as{op8Pool?:ReturnType<typeof mysql.createPool>};
export function getPool(){if(!globalDb.op8Pool){globalDb.op8Pool=mysql.createPool({uri:process.env.DATABASE_URL,host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectionLimit:10,enableKeepAlive:true})}return globalDb.op8Pool}
export function getDb(){return drizzle(getPool(),{schema,mode:"default"})}

