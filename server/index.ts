import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listVehicles } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const PORT = Number(process.env.PORT) || 3001;

function corsOrigins(): string[] | boolean {
  const local = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ];
  const render = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
  const extra = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const list = [...local, ...(render ? [render] : []), ...extra];
  return list.length > 0 ? list : true;
}

const app = express();
app.use(cors({ origin: corsOrigins() }));

app.get("/api/vehicles", async (_req, res) => {
  try {
    const vehicles = await listVehicles();
    res.json({ vehicles });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : "internal error",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(distDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.listen(PORT, () => {
  const mode = fs.existsSync(distDir) ? "web+api" : "api-only";
  console.log(`[server] ${mode} http://localhost:${PORT}`);
});
