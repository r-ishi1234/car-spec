/** API の `manufacturer` と同一（シードで拡張） */
export const VEHICLE_MANUFACTURERS = ["Toyota", "Honda", "Nissan"] as const;
export type VehicleManufacturer = (typeof VEHICLE_MANUFACTURERS)[number];

/** 車両スペック（API / DB と共通） */
export type ToyotaVehicleSpec = {
  id: string;
  manufacturer: VehicleManufacturer;
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
  /** 前輪タイヤサイズ表記（例: 205/55R17）。未設定時は null */
  tireFront?: string | null;
  /** 後輪タイヤサイズ表記 */
  tireRear?: string | null;
  /** 表ヘッダー用（車種ごとの参考画像 URL、未設定時は空文字） */
  imageUrl: string;
};
