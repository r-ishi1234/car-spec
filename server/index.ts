import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDatabase, listVehicles } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

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

async function start() {
  try {
    await getDatabase();
    console.log("[db] ready");
  } catch (e) {
    console.error("[db] init failed", e);
  }
  app.listen(PORT, "0.0.0.0", () => {
    const mode = fs.existsSync(distDir) ? "web+api" : "api-only";
    console.log(`[server] ${mode} http://0.0.0.0:${PORT}`);
  });
}

void start();
