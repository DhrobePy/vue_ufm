import { query } from '~/server/utils/db'

// Map form type values → DB category enum
const CATEGORY_MAP: Record<string, string> = {
  pickup:       'Pickup',
  mini_truck:   'Truck',
  medium_truck: 'Truck',
  heavy_truck:  'Truck',
  van:          'Van',
  Truck:        'Truck',
  Van:          'Van',
  Pickup:       'Pickup',
  Motorcycle:   'Motorcycle',
  Other:        'Other',
}

// Map form fuel values → DB enum
const FUEL_MAP: Record<string, string> = {
  diesel: 'Diesel',
  petrol: 'Petrol',
  cng:    'CNG',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    vehicle_number,
    category,
    make,
    model,
    year,
    capacity_kg,      // in kg
    fuel_type,
    vehicle_type,     // 'Own' | 'Rented'
    assigned_branch_id,
    rental_rate_per_day,
    registration_expiry,
    insurance_expiry,
    next_service_due_date,
    notes,
  } = body ?? {}

  if (!vehicle_number || !category || !capacity_kg)
    throw createError({ statusCode: 400, statusMessage: 'vehicle_number, category, and capacity_kg are required' })

  const mappedCategory = CATEGORY_MAP[category] ?? 'Truck'
  const mappedFuel     = FUEL_MAP[fuel_type]    ?? 'Diesel'
  const ownership      = vehicle_type === 'Rented' ? 'Rented' : 'Owned'

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
      make  || null,
      model || null,
      year  ? Number(year) : null,
      Number(capacity_kg),
      mappedFuel,
      vehicle_type === 'Rented' ? 'Rented' : 'Own',
      ownership,
      assigned_branch_id ? Number(assigned_branch_id) : null,
      rental_rate_per_day ? Number(rental_rate_per_day) : null,
      next_service_due_date || null,
      notes || null,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})
