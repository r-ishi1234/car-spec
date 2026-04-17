import {
  VEHICLE_MANUFACTURERS,
  type ToyotaVehicleSpec,
  type VehicleManufacturer,
} from "../types/vehicleSpec";

const base = import.meta.env.VITE_API_BASE ?? "";

function normalizeManufacturer(raw: unknown): VehicleManufacturer {
  if (
    typeof raw === "string" &&
    (VEHICLE_MANUFACTURERS as readonly string[]).includes(raw)
  ) {
    return raw as VehicleManufacturer;
  }
  return "Toyota";
}

export async function fetchVehicles(): Promise<ToyotaVehicleSpec[]> {
  const res = await fetch(`${base}/api/vehicles`);
  if (!res.ok) {
    throw new Error(`車両データの取得に失敗しました (HTTP ${res.status})`);
  }
  const data = (await res.json()) as { vehicles: ToyotaVehicleSpec[] };
  if (!Array.isArray(data.vehicles)) {
    throw new Error("API の応答形式が不正です");
  }
  return data.vehicles.map((v) => ({
    ...v,
    manufacturer: normalizeManufacturer(
      (v as { manufacturer?: unknown }).manufacturer
    ),
  }));
}
