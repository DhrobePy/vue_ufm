import { query } from '~/server/utils/db'

/**
 * GET /api/fleet/trips/consolidation-suggestions
 *
 * Read-only analysis, not an automatic action. Looks at trips still in
 * 'scheduled' status (in_progress/completed trips are already committed to a
 * vehicle — nothing to suggest) and flags pairs that share a trip_date and
 * either origin or destination, where the combined weight_kg would fit
 * inside one currently-available vehicle. Dismissed pairs (see the POST
 * handler in this same file) are filtered out so a dispatcher who already
 * said "no" doesn't see the same nag on every reload.
 */

interface TripRow {
  id: number
  trip_number: string
  trip_date: string
  origin: string | null
  destination: string | null
  weight_kg: number | string | null
  vehicle_id: number
}

interface VehicleRow {
  id: number
  registration_no: string
  weight_capacity_kg: number | string
}

const norm = (s: string | null | undefined) => (s || '').trim().toLowerCase()

export default defineEventHandler(async (event) => {
  const [trips, vehicles, dismissals] = await Promise.all([
    query<TripRow>(
      `SELECT id, trip_number, trip_date, origin, destination, weight_kg, vehicle_id
       FROM trips
       WHERE trip_status = 'scheduled'
       ORDER BY trip_date, id`,
    ),
    query<VehicleRow>(
      `SELECT id, registration_no, weight_capacity_kg
       FROM fleet_vehicles
       WHERE status = 'available' AND weight_capacity_kg IS NOT NULL
       ORDER BY weight_capacity_kg ASC`,
    ),
    query<{ trip_id_a: number; trip_id_b: number }>(
      `SELECT trip_id_a, trip_id_b FROM fleet_trip_consolidation_dismissals`,
    ),
  ])

  const dismissedSet = new Set(dismissals.map(d => `${d.trip_id_a}:${d.trip_id_b}`))

  // Group scheduled trips by trip_date — only same-day trips can share a vehicle.
  const byDate = new Map<string, TripRow[]>()
  for (const t of trips) {
    const key = String(t.trip_date)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(t)
  }

  const suggestions: any[] = []

  for (const dayTrips of byDate.values()) {
    for (let i = 0; i < dayTrips.length; i++) {
      for (let j = i + 1; j < dayTrips.length; j++) {
        const a = dayTrips[i]
        const b = dayTrips[j]

        const originMatch = !!norm(a.origin) && norm(a.origin) === norm(b.origin)
        const destMatch    = !!norm(a.destination) && norm(a.destination) === norm(b.destination)
        if (!originMatch && !destMatch) continue

        // Need real weight data on both trips to judge whether they'd fit
        // together — silently skip pairs with missing/zero weight rather
        // than guessing.
        const wA = Number(a.weight_kg) || 0
        const wB = Number(b.weight_kg) || 0
        if (wA <= 0 || wB <= 0) continue

        const combined = wA + wB
        const fitVehicle = vehicles.find(v => Number(v.weight_capacity_kg) >= combined)
        if (!fitVehicle) continue

        const idA = Math.min(a.id, b.id)
        const idB = Math.max(a.id, b.id)
        if (dismissedSet.has(`${idA}:${idB}`)) continue

        suggestions.push({
          trip_id_a: idA,
          trip_id_b: idB,
          trip_date: a.trip_date,
          match_on: originMatch && destMatch ? 'origin & destination' : (originMatch ? 'origin' : 'destination'),
          combined_weight_kg: combined,
          trip_a: { id: a.id, trip_number: a.trip_number, origin: a.origin, destination: a.destination, weight_kg: wA, vehicle_id: a.vehicle_id },
          trip_b: { id: b.id, trip_number: b.trip_number, origin: b.origin, destination: b.destination, weight_kg: wB, vehicle_id: b.vehicle_id },
          vehicle: { id: fitVehicle.id, registration_no: fitVehicle.registration_no, weight_capacity_kg: Number(fitVehicle.weight_capacity_kg) },
        })
      }
    }
  }

  return { suggestions }
})
