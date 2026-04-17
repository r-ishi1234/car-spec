import initSqlJs, { type Database as SqlDatabase } from "sql.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { headerImageUrlForVehicle } from "./modelHeaderImages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const dbPath = path.join(dataDir, "specs.db");
const seedPath = path.join(projectRoot, "server", "seed-vehicles.json");

type SeedVehicle = {
  id: string;
  modelName: string;
  grade: string;
  bodyType: string;
  powertrain: string;
  displacementL: number | null;
  transmission: string;
  drive: string;
  seats: number;
  wltcKmL: number | null;
  fuelJc08KmL?: number | null;
  fuelWltcCityKmL?: number | null;
  fuelWltcSuburbKmL?: number | null;
  fuelWltcHighwayKmL?: number | null;
  priceMinMan?: number | null;
  priceMaxMan?: number | null;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  modelYearNote: string;
  /** 省略時は空（シード追記で拡張） */
  tireFront?: string | null;
  tireRear?: string | null;
  /** 省略時は Toyota（既存シード互換） */
  manufacturer?: string;
};

export type ApiVehicle = {
  id: string;
  manufacturer: string;
  modelName: string;
  grade: string;
  bodyType: string;
  powertrain: string;
  displacementL: number | null;
  transmission: string;
  drive: "FF" | "FR" | "AWD" | "4WD";
  seats: number;
  wltcKmL: number | null;
  fuelJc08KmL?: number | null;
  fuelWltcCityKmL?: number | null;
  fuelWltcSuburbKmL?: number | null;
  fuelWltcHighwayKmL?: number | null;
  priceMinMan?: number | null;
  priceMaxMan?: number | null;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  modelYearNote: string;
  tireFront: string | null;
  tireRear: string | null;
  /** 表ヘッダー用（車種ごとの参考画像 URL） */
  imageUrl: string;
};

type VehicleFromDb = Omit<ApiVehicle, "imageUrl">;

function rowObjectToVehicle(o: Record<string, unknown>): VehicleFromDb {
  return {
    id: String(o.id),
    manufacturer:
      o.manufacturer != null && String(o.manufacturer).trim() !== ""
        ? String(o.manufacturer)
        : "Toyota",
    modelName: String(o.model_name),
    grade: String(o.grade),
    bodyType: String(o.body_type),
    powertrain: String(o.powertrain),
    displacementL:
      o.displacement_l == null ? null : Number(o.displacement_l),
    transmission: String(o.transmission),
    drive: o.drive as ApiVehicle["drive"],
    seats: Number(o.seats),
    wltcKmL: o.wltc_km_l == null ? null : Number(o.wltc_km_l),
    fuelJc08KmL:
      o.fuel_jc08_km_l == null ? null : Number(o.fuel_jc08_km_l),
    fuelWltcCityKmL:
      o.fuel_wltc_city_km_l == null ? null : Number(o.fuel_wltc_city_km_l),
    fuelWltcSuburbKmL:
      o.fuel_wltc_suburb_km_l == null ? null : Number(o.fuel_wltc_suburb_km_l),
    fuelWltcHighwayKmL:
      o.fuel_wltc_highway_km_l == null ? null : Number(o.fuel_wltc_highway_km_l),
    priceMinMan: o.price_min_man == null ? null : Number(o.price_min_man),
    priceMaxMan: o.price_max_man == null ? null : Number(o.price_max_man),
    lengthMm: Number(o.length_mm),
    widthMm: Number(o.width_mm),
    heightMm: Number(o.height_mm),
    modelYearNote: String(o.model_year_note),
    tireFront:
      o.tire_front != null && String(o.tire_front).trim() !== ""
        ? String(o.tire_front)
        : null,
    tireRear:
      o.tire_rear != null && String(o.tire_rear).trim() !== ""
        ? String(o.tire_rear)
        : null,
  };
}

function persistDb(db: SqlDatabase) {
  mkdirSync(dataDir, { recursive: true });
  const data = db.export();
  writeFileSync(dbPath, Buffer.from(data));
}

function createSchema(db: SqlDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      model_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      body_type TEXT NOT NULL,
      powertrain TEXT NOT NULL,
      displacement_l REAL,
      transmission TEXT NOT NULL,
      drive TEXT NOT NULL,
      seats INTEGER NOT NULL,
      wltc_km_l REAL,
      fuel_jc08_km_l REAL,
      fuel_wltc_city_km_l REAL,
      fuel_wltc_suburb_km_l REAL,
      fuel_wltc_highway_km_l REAL,
      price_min_man REAL,
      price_max_man REAL,
      length_mm INTEGER NOT NULL,
      width_mm INTEGER NOT NULL,
      height_mm INTEGER NOT NULL,
      model_year_note TEXT NOT NULL,
      manufacturer TEXT NOT NULL DEFAULT 'Toyota',
      tire_front TEXT NOT NULL DEFAULT '',
      tire_rear TEXT NOT NULL DEFAULT ''
    );
  `);
}

/** 既存 DB（manufacturer 列なし）向けマイグレーション */
function ensureManufacturerColumn(db: SqlDatabase): boolean {
  const stmt = db.prepare("PRAGMA table_info(vehicles)");
  let has = false;
  while (stmt.step()) {
    const o = stmt.getAsObject() as Record<string, unknown>;
    if (String(o.name) === "manufacturer") {
      has = true;
      break;
    }
  }
  stmt.free();
  if (has) return false;
  db.run(
    `ALTER TABLE vehicles ADD COLUMN manufacturer TEXT NOT NULL DEFAULT 'Toyota'`
  );
  console.log("[db] migrated: added column manufacturer");
  return true;
}

/** 既存 DB（タイヤ列なし）向けマイグレーション */
function ensureTireColumns(db: SqlDatabase): boolean {
  const stmt = db.prepare("PRAGMA table_info(vehicles)");
  let hasFront = false;
  let hasRear = false;
  while (stmt.step()) {
    const o = stmt.getAsObject() as Record<string, unknown>;
    if (String(o.name) === "tire_front") hasFront = true;
    if (String(o.name) === "tire_rear") hasRear = true;
  }
  stmt.free();
  let changed = false;
  if (!hasFront) {
    db.run(
      `ALTER TABLE vehicles ADD COLUMN tire_front TEXT NOT NULL DEFAULT ''`
    );
    changed = true;
  }
  if (!hasRear) {
    db.run(
      `ALTER TABLE vehicles ADD COLUMN tire_rear TEXT NOT NULL DEFAULT ''`
    );
    changed = true;
  }
  if (changed) {
    console.log("[db] migrated: added columns tire_front / tire_rear");
  }
  return changed;
}

function seedManufacturer(v: SeedVehicle): string {
  const m = v.manufacturer?.trim();
  return m && m.length > 0 ? m : "Toyota";
}

function seedTireFront(v: SeedVehicle): string {
  const s = v.tireFront?.trim();
  return s && s.length > 0 ? s : "";
}

function seedTireRear(v: SeedVehicle): string {
  const s = v.tireRear?.trim();
  return s && s.length > 0 ? s : "";
}

function seedFromJson(db: SqlDatabase) {
  const raw = readFileSync(seedPath, "utf8");
  const vehicles = JSON.parse(raw) as SeedVehicle[];

  const stmt = db.prepare(`
    INSERT INTO vehicles (
      id, model_name, grade, body_type, powertrain, displacement_l,
      transmission, drive, seats, wltc_km_l,
      fuel_jc08_km_l, fuel_wltc_city_km_l, fuel_wltc_suburb_km_l, fuel_wltc_highway_km_l,
      price_min_man, price_max_man,
      length_mm, width_mm, height_mm, model_year_note, manufacturer,
      tire_front, tire_rear
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  for (const v of vehicles) {
    stmt.run([
      v.id,
      v.modelName,
      v.grade,
      v.bodyType,
      v.powertrain,
      v.displacementL,
      v.transmission,
      v.drive,
      v.seats,
      v.wltcKmL,
      v.fuelJc08KmL ?? null,
      v.fuelWltcCityKmL ?? null,
      v.fuelWltcSuburbKmL ?? null,
      v.fuelWltcHighwayKmL ?? null,
      v.priceMinMan ?? null,
      v.priceMaxMan ?? null,
      v.lengthMm,
      v.widthMm,
      v.heightMm,
      v.modelYearNote,
      seedManufacturer(v),
      seedTireFront(v),
      seedTireRear(v),
    ]);
  }
  stmt.free();
  console.log(`[db] seeded ${vehicles.length} vehicles from seed-vehicles.json`);
}

/** シードにあって DB に無い id だけ追加（既存行はそのまま） */
function mergeNewVehiclesFromSeed(db: SqlDatabase): number {
  createSchema(db);
  ensureManufacturerColumn(db);
  ensureTireColumns(db);
  const raw = readFileSync(seedPath, "utf8");
  const vehicles = JSON.parse(raw) as SeedVehicle[];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO vehicles (
      id, model_name, grade, body_type, powertrain, displacement_l,
      transmission, drive, seats, wltc_km_l,
      fuel_jc08_km_l, fuel_wltc_city_km_l, fuel_wltc_suburb_km_l, fuel_wltc_highway_km_l,
      price_min_man, price_max_man,
      length_mm, width_mm, height_mm, model_year_note, manufacturer,
      tire_front, tire_rear
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  let added = 0;
  for (const v of vehicles) {
    stmt.run([
      v.id,
      v.modelName,
      v.grade,
      v.bodyType,
      v.powertrain,
      v.displacementL,
      v.transmission,
      v.drive,
      v.seats,
      v.wltcKmL,
      v.fuelJc08KmL ?? null,
      v.fuelWltcCityKmL ?? null,
      v.fuelWltcSuburbKmL ?? null,
      v.fuelWltcHighwayKmL ?? null,
      v.priceMinMan ?? null,
      v.priceMaxMan ?? null,
      v.lengthMm,
      v.widthMm,
      v.heightMm,
      v.modelYearNote,
      seedManufacturer(v),
      seedTireFront(v),
      seedTireRear(v),
    ]);
    if (db.getRowsModified() > 0) added += 1;
  }
  stmt.free();
  if (added > 0) {
    console.log(`[db] merged ${added} new vehicle(s) from seed-vehicles.json`);
  }
  return added;
}

/** シードの modelYearNote を既存行の model_year_note に反映（id が一致する行のみ） */
function syncModelYearNotesFromSeed(db: SqlDatabase): number {
  createSchema(db);
  ensureManufacturerColumn(db);
  const raw = readFileSync(seedPath, "utf8");
  const vehicles = JSON.parse(raw) as SeedVehicle[];

  const stmt = db.prepare(
    `UPDATE vehicles SET model_year_note = ? WHERE id = ?`
  );

  let updated = 0;
  for (const v of vehicles) {
    stmt.run([v.modelYearNote, v.id]);
    if (db.getRowsModified() > 0) updated += 1;
  }
  stmt.free();

  if (updated > 0) {
    console.log(
      `[db] synced model_year_note for ${updated} vehicle(s) from seed-vehicles.json`
    );
  }
  return updated;
}

/** シードの tireFront / tireRear を既存行に反映（id が一致する行のみ） */
function syncTireSizesFromSeed(db: SqlDatabase): number {
  createSchema(db);
  ensureManufacturerColumn(db);
  ensureTireColumns(db);
  const raw = readFileSync(seedPath, "utf8");
  const vehicles = JSON.parse(raw) as SeedVehicle[];

  const stmt = db.prepare(
    `UPDATE vehicles SET tire_front = ?, tire_rear = ? WHERE id = ?`
  );

  let updated = 0;
  for (const v of vehicles) {
    stmt.run([seedTireFront(v), seedTireRear(v), v.id]);
    if (db.getRowsModified() > 0) updated += 1;
  }
  stmt.free();

  if (updated > 0) {
    console.log(
      `[db] synced tire_front/tire_rear for ${updated} vehicle(s) from seed-vehicles.json`
    );
  }
  return updated;
}

let dbPromise: Promise<SqlDatabase> | null = null;

async function openDatabase(): Promise<SqlDatabase> {
  const SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(projectRoot, "node_modules", "sql.js", "dist", file),
  });

  if (existsSync(dbPath)) {
    const buf = readFileSync(dbPath);
    const db = new SQL.Database(buf);
    createSchema(db);
    const migrated = ensureManufacturerColumn(db);
    const tireMigrated = ensureTireColumns(db);
    const added = mergeNewVehiclesFromSeed(db);
    const synced = syncModelYearNotesFromSeed(db);
    const tireSynced = syncTireSizesFromSeed(db);
    if (added > 0 || synced > 0 || migrated || tireMigrated || tireSynced > 0) {
      persistDb(db);
    }
    return db;
  }
  const db = new SQL.Database();
  createSchema(db);
  ensureManufacturerColumn(db);
  ensureTireColumns(db);
  seedFromJson(db);
  persistDb(db);
  return db;
}

export function getDatabase(): Promise<SqlDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}

export async function listVehicles(): Promise<ApiVehicle[]> {
  const db = await getDatabase();
  const stmt = db.prepare(
    `SELECT * FROM vehicles
     ORDER BY manufacturer COLLATE NOCASE, model_name COLLATE NOCASE, grade COLLATE NOCASE`
  );
  const out: ApiVehicle[] = [];
  while (stmt.step()) {
    const row = rowObjectToVehicle(stmt.getAsObject());
    out.push({
      ...row,
      imageUrl: headerImageUrlForVehicle(row.manufacturer, row.modelName),
    });
  }
  stmt.free();
  return out;
}
