import { defineConfig, type Plugin } from "vite";
import { existsSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { enforceReadOnly } from "./scripts/read-only.ts";
const readOnlyBoundary: Plugin = { name: "atlas-read-only-boundary", configureServer(server) { server.middlewares.use((req, res, next) => { if (!enforceReadOnly(req, res)) next(); }); }, configurePreviewServer(server) { server.middlewares.use((req, res, next) => { if (!enforceReadOnly(req, res)) next(); }); } };
export default defineConfig({ define: { __ATLAS_LOCAL__: "false" }, plugins: [{ name:"public-data-boundary", buildStart(){ if(existsSync(fileURLToPath(new URL("public/uploads/",import.meta.url)))) throw new Error("Private legacy public/uploads directory exists. Move it outside public before building; use explicit public export for local images."); } }, readOnlyBoundary, react()], resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } }, server: { host: "127.0.0.1", port: 5174 }, preview: { host: "127.0.0.1", port: 4174 }, build: { sourcemap: false } });
