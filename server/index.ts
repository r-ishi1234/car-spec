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

/** 空なら制限なし。例: "61.113.94.120" または "1.2.3.4,5.6.7.8"（Cloud Run では trust proxy 必須） */
const allowedIps = (process.env.ALLOWED_IPS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function normalizeClientIp(raw: string): string {
  if (raw.startsWith("::ffff:")) return raw.slice(7);
  return raw;
}

function getClientIp(req: express.Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") {
    const first = xff.split(",")[0]?.trim();
    if (first) return normalizeClientIp(first);
  }
  const ra = req.socket.remoteAddress;
  return ra ? normalizeClientIp(ra) : "";
}

const app = express();
app.set("trust proxy", 1);

app.use((req, res, next) => {
  if (allowedIps.length === 0) {
    next();
    return;
  }
  const ip = getClientIp(req);
  if (allowedIps.includes(ip)) {
    next();
    return;
  }
  console.warn("[ip] deny", ip, req.method, req.url);
  res.status(403).send("Forbidden");
});

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
