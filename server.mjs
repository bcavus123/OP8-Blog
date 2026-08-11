import { resolve } from "node:path";

import { startProdServer } from "vinext/server/prod-server";

const port = Number(process.env.PORT || 3000);

await startProdServer({
  host: "0.0.0.0",
  outDir: resolve("dist"),
  port,
});
