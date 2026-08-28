import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/pocket-writer/" : "/",
  plugins: [preact()],
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
} as any);
