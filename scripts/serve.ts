import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
import { enforceReadOnly } from "./read-only.ts";
const directory = fileURLToPath(new URL(process.argv.includes("--public-export") ? "../.local/public-export/" : "../dist/", import.meta.url));
const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".geojson": "application/geo+json", ".png": "image/png", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const server = createServer(async (req, res) => {
 if (enforceReadOnly(req, res)) return;
 try {
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  let filename = resolve(directory, "." + pathname);
  if (filename !== resolve(directory) && !filename.startsWith(directory.endsWith(sep) ? directory : directory + sep)) { res.writeHead(403); res.end(); return; }
  try { if ((await stat(filename)).isDirectory()) filename = resolve(filename, "index.html"); } catch { if (!extname(pathname)) filename = resolve(directory, "index.html"); else { res.writeHead(404); res.end(); return; } }
  const body = await readFile(filename);
  // Preserve source image bytes while serving PNG content under legacy JPEG extensions accurately.
  const isPng = body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  res.writeHead(200, { "Content-Type": isPng ? "image/png" : types[extname(filename)] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff" }); res.end(req.method === "HEAD" ? undefined : body);
 } catch { res.writeHead(404); res.end("Not found"); }
});
server.listen(Number(process.env.PORT ?? 4174), "127.0.0.1", () => console.log("Wandering Atlas read-only server ready"));
