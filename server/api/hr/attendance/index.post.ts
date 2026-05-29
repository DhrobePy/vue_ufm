import { query, queryOne, getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action } = body ?? {}

  // ── MANUAL ENTRY ──────────────────────────────────────────
  if (action === 'manual') {
    const { employee_id, date, clock_in, clock_out, status, notes } = body
    if (!employee_id || !date) throw createError({ statusCode: 400, statusMessage: 'employee_id and date required' })

    await getDb().query(
      `INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, manual_entry, notes)
       VALUES (?, ?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         clock_in = VALUES(clock_in), clock_out = VALUES(clock_out),
         status = VALUES(status), manual_entry = 1, notes = VALUES(notes)`,
      [employee_id, date, clock_in || null, clock_out || null, status || 'present', notes || null]
    )
    return { ok: true, message: 'Attendance recorded.' }
  }

  // ── BULK MANUAL ENTRY ─────────────────────────────────────
  if (action === 'bulk_manual') {
    const { records } = body  // Array of { employee_id, date, clock_in, clock_out, status }
    if (!Array.isArray(records) || !records.length)
      throw createError({ statusCode: 400, statusMessage: 'records array required' })

    const db = getDb()
    let count = 0
    for (const r of records) {
      if (!r.employee_id || !r.date) continue
      await db.query(
        `INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, manual_entry)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           clock_in = VALUES(clock_in), clock_out = VALUES(clock_out),
           status = VALUES(status), manual_entry = 1`,
        [r.employee_id, r.date, r.clock_in || null, r.clock_out || null, r.status || 'present']
      )
      count++
    }
    return { ok: true, count, message: `${count} records saved.` }
  }

  // ── CLOCK IN ───────────────────────────────────────────────
  if (action === 'clock_in') {
    const { employee_id } = body
    if (!employee_id) throw createError({ statusCode: 400, statusMessage: 'employee_id required' })
    const today = new Date().toISOString().slice(0, 10)
    const timeNow = new Date().toTimeString().slice(0, 8)  // HH:MM:SS

    const existing = await queryOne(
      'SELECT id FROM hr_attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    )
    if (existing) throw createError({ statusCode: 400, statusMessage: 'Already clocked in today' })

    await getDb().query(
      'INSERT INTO hr_attendance (employee_id, date, clock_in, status) VALUES (?, ?, ?, ?)',
      [employee_id, today, timeNow, 'present']
    )
    return { ok: true, message: 'Clocked in.' }
  }

  // ── CLOCK OUT ──────────────────────────────────────────────
  if (action === 'clock_out') {
    const { employee_id } = body
    if (!employee_id) throw createError({ statusCode: 400, statusMessage: 'employee_id required' })
    const today = new Date().toISOString().slice(0, 10)
    const timeNow = new Date().toTimeString().slice(0, 8)

    await query(
      'UPDATE hr_attendance SET clock_out = ? WHERE employee_id = ? AND date = ? AND clock_out IS NULL',
      [timeNow, employee_id, today]
    )
    return { ok: true, message: 'Clocked out.' }
  }

  // ── DELETE ─────────────────────────────────────────────────
  if (action === 'delete') {
    const { id } = body
    if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
    await query('DELETE FROM hr_attendance WHERE id = ?', [id])
    return { ok: true, message: 'Record deleted.' }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
