import express, { Request, Response, Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";

// Define vite config inline to avoid import issues
const viteConfig = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../client/src"),
      "@components": path.resolve(__dirname, "../client/src/components"),
      "@server": path.resolve(__dirname, "../server"),
      "@assets": path.resolve(__dirname, "../client/public/assets"),
    },
  },
  root: path.resolve(__dirname, "../client"),
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    fs: {
      allow: ["."],
    },
  },
};
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "vite") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`[${formattedTime}] [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    configFile: false,
    appType: "custom",
    mode: "development",
    base: "/",
    publicDir: path.resolve(__dirname, "../client/public"),
    cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
    resolve: viteConfig.resolve,
    root: viteConfig.root,
    build: viteConfig.build,
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const templatePath = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );

    
      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(
        'src="/src/main.tsx"',
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `❌ Could not find static build directory: ${distPath}. Make sure you've run the build process.`
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
