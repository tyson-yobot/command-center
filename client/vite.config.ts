// -----------------------------------------------------------------------------
// 📦 vite.config.ts — Full YoBot® Build Config (Cleaned)
// -----------------------------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// -----------------------------------------------------------------------------

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },

  root: path.resolve(__dirname), // 🔁 Project root (where index.html lives)

  server: {
    port: 5176, // 👈 use 5176 or 5177 to avoid clash with 3000
    strictPort: true,
  },

  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
});
