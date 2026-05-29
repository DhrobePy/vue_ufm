import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    vehicle_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    service_provider,
    odometer_reading,
    next_service_date,
    invoice_number,
    notes,
  } = body ?? {}

  if (!vehicle_id || !maintenance_type) {
    throw createError({ statusCode: 400, statusMessage: 'vehicle_id and maintenance_type are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query<any>(
      `INSERT INTO maintenance_logs
         (vehicle_id, maintenance_date, maintenance_type, description, cost,
          service_provider, odometer_reading, next_service_date, invoice_number, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        maintenance_date ?? new Date().toISOString().slice(0, 10),
        maintenance_type,
        description ?? null,
        Number(cost || 0),
        service_provider ?? null,
        odometer_reading ? Number(odometer_reading) : null,
        next_service_date ?? null,
        invoice_number ?? null,
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
