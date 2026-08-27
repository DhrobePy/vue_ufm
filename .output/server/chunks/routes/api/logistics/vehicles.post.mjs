import { q as defineEventHandler, au as readBody, m as createError, ar as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const CATEGORY_MAP = {
  pickup: "Pickup",
  mini_truck: "Truck",
  medium_truck: "Truck",
  heavy_truck: "Truck",
  van: "Van",
  Truck: "Truck",
  Van: "Van",
  Pickup: "Pickup",
  Motorcycle: "Motorcycle",
  Other: "Other"
};
const FUEL_MAP = {
  diesel: "Diesel",
  petrol: "Petrol",
  cng: "CNG"
};
const vehicles_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const {
    vehicle_number,
    category,
    make,
    model,
    year,
    capacity_kg,
    // in kg
    fuel_type,
    vehicle_type,
    // 'Own' | 'Rented'
    assigned_branch_id,
    rental_rate_per_day,
    registration_expiry,
    insurance_expiry,
    next_service_due_date,
    notes
  } = body != null ? body : {};
  if (!vehicle_number || !category || !capacity_kg)
    throw createError({ statusCode: 400, statusMessage: "vehicle_number, category, and capacity_kg are required" });
  const mappedCategory = (_a = CATEGORY_MAP[category]) != null ? _a : "Truck";
  const mappedFuel = (_b = FUEL_MAP[fuel_type]) != null ? _b : "Diesel";
  const ownership = vehicle_type === "Rented" ? "Rented" : "Owned";
  const result = await query(
    `INSERT INTO vehicles
       (vehicle_number, category, make, model, year,
        capacity_kg, fuel_type, vehicle_type, ownership_status,
        assigned_branch_id, rental_rate_per_day,
        next_service_due_date, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
    [
      vehicle_number.trim().toUpperCase(),
      mappedCategory,
      make || null,
      model || null,
      year ? Number(year) : null,
      Number(capacity_kg),
      mappedFuel,
      vehicle_type === "Rented" ? "Rented" : "Own",
      ownership,
      assigned_branch_id ? Number(assigned_branch_id) : null,
      rental_rate_per_day ? Number(rental_rate_per_day) : null,
      next_service_due_date || null,
      notes || null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { vehicles_post as default };
//# sourceMappingURL=vehicles.post.mjs.map
