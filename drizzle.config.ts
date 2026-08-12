Exit code: 0
Wall time: 2.4 seconds
Output:
import{defineConfig}from"drizzle-kit";
export default defineConfig({out:"./drizzle-mysql",schema:"./db/schema.ts",dialect:"mysql",dbCredentials:{url:process.env.DATABASE_URL||"mysql://user:password@localhost:3306/op8_blog"}});

