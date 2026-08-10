import { q as defineEventHandler, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const norm = (s) => (s || "").trim().toLowerCase();
const consolidationSuggestions_get = defineEventHandler(async (event) => {
  const [trips, vehicles, dismissals] = await Promise.all([
    query(
      `SELECT id, trip_number, trip_date, origin, destination, weight_kg, vehicle_id
       FROM trips
       WHERE trip_status = 'scheduled'
       ORDER BY trip_date, id`
    ),
    query(
      `SELECT id, registration_no, weight_capacity_kg
       FROM fleet_vehicles
       WHERE status = 'available' AND weight_capacity_kg IS NOT NULL
       ORDER BY weight_capacity_kg ASC`
    ),
    query(
      `SELECT trip_id_a, trip_id_b FROM fleet_trip_consolidation_dismissals`
    )
  ]);
  const dismissedSet = new Set(dismissals.map((d) => `${d.trip_id_a}:${d.trip_id_b}`));
  const byDate = /* @__PURE__ */ new Map();
  for (const t of trips) {
    const key = String(t.trip_date);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(t);
  }
  const suggestions = [];
  for (const dayTrips of byDate.values()) {
    for (let i = 0; i < dayTrips.length; i++) {
      for (let j = i + 1; j < dayTrips.length; j++) {
        const a = dayTrips[i];
        const b = dayTrips[j];
        const originMatch = !!norm(a.origin) && norm(a.origin) === norm(b.origin);
        const destMatch = !!norm(a.destination) && norm(a.destination) === norm(b.destination);
        if (!originMatch && !destMatch) continue;
        const wA = Number(a.weight_kg) || 0;
        const wB = Number(b.weight_kg) || 0;
        if (wA <= 0 || wB <= 0) continue;
        const combined = wA + wB;
        const fitVehicle = vehicles.find((v) => Number(v.weight_capacity_kg) >= combined);
        if (!fitVehicle) continue;
        const idA = Math.min(a.id, b.id);
        const idB = Math.max(a.id, b.id);
        if (dismissedSet.has(`${idA}:${idB}`)) continue;
        suggestions.push({
          trip_id_a: idA,
          trip_id_b: idB,
          trip_date: a.trip_date,
          match_on: originMatch && destMatch ? "origin & destination" : originMatch ? "origin" : "destination",
          combined_weight_kg: combined,
          trip_a: { id: a.id, trip_number: a.trip_number, origin: a.origin, destination: a.destination, weight_kg: wA, vehicle_id: a.vehicle_id },
          trip_b: { id: b.id, trip_number: b.trip_number, origin: b.origin, destination: b.destination, weight_kg: wB, vehicle_id: b.vehicle_id },
          vehicle: { id: fitVehicle.id, registration_no: fitVehicle.registration_no, weight_capacity_kg: Number(fitVehicle.weight_capacity_kg) }
        });
      }
    }
  }
  return { suggestions };
});

export { consolidationSuggestions_get as default };
//# sourceMappingURL=consolidation-suggestions.get.mjs.map
