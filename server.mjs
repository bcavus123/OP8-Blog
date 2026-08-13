import { resolve } from "node:path";
import { existsSync } from "node:fs";

import { startProdServer } from "vinext/server/prod-server";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const port = Number(process.env.PORT || 3000);

await startProdServer({
  host: "0.0.0.0",
  outDir: resolve("dist"),
  port,
});
