/**
 * 車両マスタは SQLite（`data/specs.db`）に保存し、API 経由で取得します。
 * 初回起動時は `server/seed-vehicles.json` から DB に投入されます。
 */
export type { ToyotaVehicleSpec, VehicleManufacturer } from "../types/vehicleSpec";
export { VEHICLE_MANUFACTURERS } from "../types/vehicleSpec";
