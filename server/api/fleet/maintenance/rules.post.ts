import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { rule_name, vehicle_type, interval_km, interval_days, description, is_active } = body ?? {}

  if (!rule_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Rule name is required' })

  const result = await query(
    `INSERT INTO preventive_maintenance_rules (rule_name, vehicle_type, interval_km, interval_days, description, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      rule_name.trim(),
      vehicle_type || null,
      interval_km  ? Number(interval_km)  : null,
      interval_days ? Number(interval_days) : null,
      description  || null,
      is_active !== false ? 1 : 0,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})
