import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  build: {
    target: "es2022", outDir: "dist", assetsInlineLimit: 0,
    rollupOptions: { input: { main: resolve(import.meta.dirname, "index.html"), talk: resolve(import.meta.dirname, "talks/ai/index.html") } },
  },
  worker: { format: "es" },
});
