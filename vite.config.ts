// ======================================
// vite.config.ts — FIXED, NO PARAMS, FULLY AUTOMATED
// ======================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
<<<<<<< HEAD

=======
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
>>>>>>> 692751fa02aec1a95d0ca2c3113091d5e0732d44
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@components": path.resolve(__dirname, "client/src/components"),
      "@server": path.resolve(__dirname, "server"),
      "@assets": path.resolve(__dirname, "client/public/assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
<<<<<<< HEAD
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ["."],
    },
  },
});
=======
});
>>>>>>> 692751fa02aec1a95d0ca2c3113091d5e0732d44
