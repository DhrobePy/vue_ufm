import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    vehicle_id,
    fuel_date,
    fuel_type,
    quantity_liters,
    price_per_liter,
    station_name,
    odometer_reading,
    filled_by,
    receipt_number,
    notes,
  } = body ?? {}

  if (!vehicle_id || !quantity_liters || !price_per_liter) {
    throw createError({ statusCode: 400, statusMessage: 'vehicle_id, quantity_liters, and price_per_liter are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query<any>(
      `INSERT INTO fuel_logs
         (vehicle_id, fuel_date, fuel_type, quantity_liters, price_per_liter,
          station_name, odometer_reading, filled_by, receipt_number, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        fuel_date ?? new Date().toISOString().slice(0, 10),
        fuel_type ?? 'Diesel',
        Number(quantity_liters),
        Number(price_per_liter),
        station_name ?? null,
        odometer_reading ? Number(odometer_reading) : null,
        filled_by ?? null,
        receipt_number ?? null,
        notes ?? null,
        userId,
      ],
    )
    await conn.commit()
    return { ok: true, id: result.insertId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
