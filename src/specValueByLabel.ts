import type { ToyotaVehicleSpec } from "./types/vehicleSpec";

function mmToM(mm: number): string {
  return (mm / 1000).toFixed(2);
}

function fmt1(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return (Math.round(n * 10) / 10).toFixed(1);
}

function fmtMan(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

function fmtTireSize(s: string | null | undefined): string {
  const t = s?.trim();
  return t && t.length > 0 ? t : "—";
}

/** マスタ未設定時: WLTC 平均から JC08 っぽい値を概算（参考・カタログ値ではない） */
function jc08OrEstimate(v: ToyotaVehicleSpec): number | null {
  if (v.fuelJc08KmL != null) return v.fuelJc08KmL;
  if (v.wltcKmL != null) return Math.round(v.wltcKmL * 1.14 * 10) / 10;
  return null;
}

/** マスタ未設定時: WLTC 平均からモード別を概算（参考） */
function wltcModeOrEstimate(
  v: ToyotaVehicleSpec,
  mode: "city" | "suburb" | "highway"
): number | null {
  const explicit =
    mode === "city"
      ? v.fuelWltcCityKmL
      : mode === "suburb"
        ? v.fuelWltcSuburbKmL
        : v.fuelWltcHighwayKmL;
  if (explicit != null) return explicit;
  if (v.wltcKmL == null) return null;
  const factor = mode === "city" ? 0.86 : mode === "suburb" ? 1.02 : 1.1;
  return Math.round(v.wltcKmL * factor * 10) / 10;
}

const GETTERS: Record<string, (v: ToyotaVehicleSpec) => string> = {
  "諸元:全長(mm)": (v) => String(v.lengthMm),
  "諸元:全幅(mm)": (v) => String(v.widthMm),
  "諸元:全高(mm)": (v) => String(v.heightMm),
  "諸元:ホイールベース(mm)": () => "—",
  "諸元:全長(m)": (v) => mmToM(v.lengthMm),
  "諸元:全幅(m)": (v) => mmToM(v.widthMm),
  "諸元:全高(m)": (v) => mmToM(v.heightMm),
  "諸元:ホイールベース(m)": () => "—",
  "車両重量(kg)": () => "—",
  エンジン: (v) => v.powertrain,
  "エンジン:気筒数": () => "—",
  "エンジン:吸気形式": () => "—",
  "エンジン:最高出力(kw)": () => "—",
  "エンジン:総排気量(cc)": (v) =>
    v.displacementL != null ? String(Math.round(v.displacementL * 1000)) : "—",
  "エンジン:最高出力(ps)": () => "—",
  "エンジン:トルク(Nm)": () => "—",
  "エンジン:トルク(m・m(kg・m)/rpm)": () => "—",
  "エンジン:最大トルク時回転数(RPM)": () => "—",
  "4×4設定有無": (v) => {
    if (v.drive === "4WD") return "あり(4WD)";
    if (v.drive === "AWD") return "あり(AWD)";
    return "なし";
  },
  "T/M設定": (v) => v.transmission,
  "燃費(km/L):JC08": (v) => fmt1(jc08OrEstimate(v)),
  "燃費(km/L):WLTC": (v) => fmt1(v.wltcKmL),
  "燃費(km/L):WLTC(平均)": (v) => fmt1(v.wltcKmL),
  "燃費(km/L):WLTC(市街地)": (v) => fmt1(wltcModeOrEstimate(v, "city")),
  "燃費(km/L):WLTC(郊外)": (v) => fmt1(wltcModeOrEstimate(v, "suburb")),
  "燃費(km/L):WLTC(高速)": (v) => fmt1(wltcModeOrEstimate(v, "highway")),
  駆動方式: (v) => v.drive,
  トランスミッション: (v) => v.transmission,
  タイヤサイズ: (v) => {
    const f = fmtTireSize(v.tireFront);
    const r = fmtTireSize(v.tireRear);
    if (f === "—" && r === "—") return "—";
    if (f === r) return f;
    if (f === "—") return `後 ${r}`;
    if (r === "—") return `前 ${f}`;
    return `前 ${f} / 後 ${r}`;
  },
  "最高価格(万円)": (v) => fmtMan(v.priceMaxMan),
  "最低価格(万円)": (v) => fmtMan(v.priceMinMan),
  前輪タイヤタイプ: (v) => fmtTireSize(v.tireFront),
  後輪タイヤタイプ: (v) => fmtTireSize(v.tireRear),
};

/** メモのラベルに対応するセル値（データが無い項目は「—」） */
export function getSpecCellValue(
  label: string,
  vehicle: ToyotaVehicleSpec
): string {
  const fn = GETTERS[label];
  return fn ? fn(vehicle) : "—";
}

/** 数値っぽい行（右寄せ・tabular） */
export function isNumericLikeLabel(label: string): boolean {
  if (/\(mm\)|\(m\)|\(kg\)|\(cc\)|\(kw\)|\(ps\)|\(Nm\)|万円|RPM/i.test(label))
    return true;
  if (label.includes("燃費")) return true;
  if (label === "定員") return true;
  return false;
}
