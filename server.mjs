import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";

import application from "./dist/server/index.js";

const clientRoot = resolve("dist/client");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function assetPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl).pathname);
  const candidate = resolve(clientRoot, `.${pathname}`);
  return candidate === clientRoot || candidate.startsWith(`${clientRoot}${sep}`)
    ? candidate
    : null;
}

async function readAsset(request) {
  const path = assetPath(request.url);
  if (!path) return new Response("Not found", { status: 404 });

  try {
    await access(path);
    const details = await stat(path);
    if (!details.isFile()) return new Response("Not found", { status: 404 });

    return new Response(Readable.toWeb(createReadStream(path)), {
      headers: {
        "cache-control": request.url.includes("/_next/static/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
        "content-length": String(details.size),
        "content-type": mimeTypes[extname(path).toLowerCase()] || "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

const assets = { fetch: readAsset };

createServer(async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || `localhost:${port}`;
    const url = `${protocol}://${host}${req.url || "/"}`;
    const method = req.method || "GET";
    const hasBody = method !== "GET" && method !== "HEAD";
    const request = new Request(url, {
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? "half" : undefined,
      headers: req.headers,
      method,
    });

    let response;
    const path = new URL(url).pathname;
    if (path.startsWith("/_next/static/") || path === "/favicon.svg" || path === "/og.png") {
      response = await readAsset(request);
    } else {
      response = await application.fetch(request, { ASSETS: assets }, {});
    }

    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (!response.body || method === "HEAD") {
      res.end();
      return;
    }

    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error("Request failed", error);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`OP8 is listening on port ${port}`);
});
