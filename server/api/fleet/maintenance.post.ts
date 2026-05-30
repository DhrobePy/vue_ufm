import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    vehicle_id, request_date, repair_type, station_supplier,
    issue_description, odometer_at_request, notes,
    tasks = [], materials = [],
  } = body ?? {}

  if (!vehicle_id || !request_date)
    throw createError({ statusCode: 400, statusMessage: 'vehicle_id and request_date are required' })

  // Generate request number
  const count = (await queryOne<any>(`SELECT COUNT(*) AS n FROM maintenance_requests`))?.n ?? 0
  const req_no = `MR-${String(Number(count) + 1).padStart(5, '0')}`

  const result = await query(
    `INSERT INTO maintenance_requests
       (request_no, vehicle_id, request_date, repair_type, station_supplier,
        issue_description, odometer_at_request, notes, status)
     VALUES (?,?,?,?,?,?,?,'pending',?)`,
    [
      req_no,
      Number(vehicle_id),
      request_date,
      repair_type       || 'corrective',
      station_supplier  || null,
      issue_description || null,
      odometer_at_request ? Number(odometer_at_request) : null,
      notes             || null,
    ],
  ) as any

  const maint_id = result.insertId

  let total_cost = 0

  // Save tasks
  for (const task of tasks) {
    if (!task.description) continue
    const cost = Number(task.service_cost) || 0
    total_cost += cost
    await query(
      `INSERT INTO maintenance_tasks (maintenance_id, description, service_cost) VALUES (?,?,?)`,
      [maint_id, task.description, cost],
    )
  }

  // Save materials
  for (const mat of materials) {
    if (!mat.item_name) continue
    const qty  = Number(mat.quantity)  || 0
    const rate = Number(mat.unit_rate) || 0
    const amt  = qty * rate
    total_cost += amt
    await query(
      `INSERT INTO maintenance_materials (maintenance_id, item_name, quantity, unit_rate, amount) VALUES (?,?,?,?,?)`,
      [maint_id, mat.item_name, qty, rate, amt],
    )
  }

  // Update total_cost
  await query(`UPDATE maintenance_requests SET total_cost = ? WHERE id = ?`, [total_cost, maint_id])

  return { ok: true, id: maint_id, request_no: req_no }
})
