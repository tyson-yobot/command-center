import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from 'vite-tsconfig-paths';
import { PluginOption } from 'vite';

import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * YoBot® Command Center — Vite configuration
 * • Production‑grade, zero placeholders
 * • Supports React + TS + shared workspace aliases
 * • Server/HMR tuned for concurrent Express backend on :3000
 */
export default defineConfig({
  plugins: [
  react(),
  tsconfigPaths() as PluginOption,
],


  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),                       // point @ to client/src
      "@components": path.resolve(__dirname, "src/components"), // Components folder under src
      "@assets": path.resolve(__dirname, "src/assets"),         // Assets folder under src
      "@backend": path.resolve(__dirname, "src/backend"),       // Backend utils under src
      "@server": path.resolve(__dirname, "../server"),          // Express backend
      "@shared": path.resolve(__dirname, "../shared")           // Shared libs / DTOs
    }
  },

  root: path.resolve(__dirname),                           // index.html lives here

  server: {
    port: 5177,
    strictPort: false,                                      // Allow fallback ports
    hmr: {
      protocol: "ws",
      host: "localhost",
      overlay: true                                         // Show Vite overlay for FE errors
    },
    proxy: {
      // Proxy API calls to Express backend during dev
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    outDir: path.resolve(__dirname, "dist/public"),         // Express serves from /dist/public
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",      // Dev: easier debugging
    rollupOptions: {
      output: {
        manualChunks: undefined                             // Let Vite handle chunking
      }
    }
  },

  // OptimizeDeps ensures faster cold starts / CI builds
  optimizeDeps: {
    include: ["react", "react-dom", "clsx"]
  }
});
