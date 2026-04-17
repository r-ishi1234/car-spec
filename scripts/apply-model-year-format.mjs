import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", "server", "seed-vehicles.json");
const data = JSON.parse(fs.readFileSync(p, "utf8"));

/** @param {string} id */
function modelYearNoteFor(id) {
  if (id === "century-1") return "2018年式〜";
  if (id.startsWith("roomy-")) return "2016年式〜";
  if (id.startsWith("aqua-")) return "2021年式〜";
  if (id.startsWith("noah-") || id.startsWith("voxy-")) return "2022年式〜";
  if (id.startsWith("prius-")) return "2023〜2024年式";
  if (id.startsWith("alphard-")) return "2023〜2024年式";
  if (id.startsWith("c-hr-")) return "2023〜2024年式";
  if (id.startsWith("sienta-")) return "2022〜2024年式";
  if (id === "gr-corolla-1") return "2022年式〜";
  if (id.startsWith("landcruiser-300-")) return "2021〜2024年式";
  if (id.startsWith("hiace-")) return "2019年式〜";
  if (id === "rav4-phev-1") return "2020〜2024年式";
  if (id.startsWith("bz4x")) return "2022〜2024年式";
  if (
    id.startsWith("crown-sport") ||
    id === "crown-sedan-1" ||
    id.startsWith("landcruiser-250")
  ) {
    return "2023〜2024年式";
  }
  if (id === "crown-1" || id.startsWith("crown-cross-")) return "2022〜2024年式";
  if (id === "supra-1") return "2019年式〜";
  if (id === "granace-1") return "2019年式〜";
  if (id === "gr86-1") return "2021年式〜";
  if (id.startsWith("yaris-cross-")) return "2020〜2024年式";
  if (id.startsWith("raize-")) return "2019〜2024年式";
  if (id === "hilux-1") return "2015年式〜";
  return "2024年式";
}

for (const v of data) {
  v.modelYearNote = modelYearNoteFor(v.id);
}

fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Updated ${data.length} rows in seed-vehicles.json`);
