import type { IncomingMessage, ServerResponse } from "node:http";
/** No former API or upload route is registered. This is an early runtime denial, not a UI flag. */
export function enforceReadOnly(req: IncomingMessage, res: ServerResponse): boolean {
 let pathname: string;
 try { pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname); } catch { res.writeHead(400); res.end("Bad request"); return true; }
 if (pathname === "/local-api" || pathname.startsWith("/local-api/") || pathname === "/api" || pathname.startsWith("/api/") || pathname === "/travel/upload" || pathname.startsWith("/travel/upload/")) { res.writeHead(404, { "Cache-Control": "no-store" }); res.end("Not found"); return true; }
 if (!["GET", "HEAD"].includes(req.method ?? "GET")) { res.writeHead(405, { Allow: "GET, HEAD", "Cache-Control": "no-store" }); res.end("Read-only application"); return true; }
 return false;
}
