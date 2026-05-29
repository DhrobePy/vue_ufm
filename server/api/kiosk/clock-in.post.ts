import { query, queryOne, getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body        = await readBody(event)
  const employeeId  = parseInt(body.employee_id ?? 0)
  const branchId    = parseInt(body.device_id ?? body.branch_id ?? 1)

  if (!employeeId) throw createError({ statusCode: 400, statusMessage: 'employee_id required' })

  const db    = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const now   = new Date()

  // Time in HH:MM:SS
  const timeOnly = now.toTimeString().slice(0, 8)

  // ── Load work settings ────────────────────────────────────────
  let workStart   = '09:00:00'
  let workEnd     = '18:00:00'
  let lateMin     = 15
  let otThreshold = 0
  let autoApprove = 0

  try {
    const [settings] = await db.query(
      "SELECT name, value FROM hr_settings WHERE name IN ('work_start','work_end','late_threshold','ot_threshold')"
    ) as any[][]
    for (const s of settings || []) {
      if (s.name === 'work_start')     workStart   = s.value.length === 5 ? s.value + ':00' : s.value
      if (s.name === 'work_end')       workEnd     = s.value.length === 5 ? s.value + ':00' : s.value
      if (s.name === 'late_threshold') lateMin     = parseInt(s.value)
      if (s.name === 'ot_threshold')   otThreshold = parseInt(s.value)
    }
    const [otRow] = await db.query('SELECT auto_approve FROM hr_overtime_settings WHERE id=1') as any[][]
    if (otRow?.[0]) autoApprove = parseInt(otRow[0].auto_approve)
  } catch { /* use defaults */ }

  // ── Insert individual punch (IGNORE deduplicates same-second scans) ──────────
  try {
    await db.query(`
      INSERT IGNORE INTO hr_attendance_punches (employee_id, date, punch_time, source)
      VALUES (?, ?, ?, 'kiosk')
    `, [employeeId, today, timeOnly])
  } catch { /* table may not exist — fall through */ }

  // ── Get all punches today ─────────────────────────────────────
  let punches: string[]  = []
  let punchCount = 1

  try {
    const [rows] = await db.query(`
      SELECT punch_time FROM hr_attendance_punches
      WHERE employee_id = ? AND date = ?
      ORDER BY punch_time ASC
    `, [employeeId, today]) as any[][]
    punches    = (rows || []).map((r: any) => r.punch_time)
    punchCount = punches.length || 1
    if (!punches.length) punches = [timeOnly]
  } catch {
    punches    = [timeOnly]
    punchCount = 1
  }

  const earliestPunch = punches[0]
  const latestPunch   = punches[punches.length - 1]

  // ── Determine attendance status ───────────────────────────────
  const punchTs = new Date(`${today}T${earliestPunch}`).getTime()
  const startTs = new Date(`${today}T${workStart}`).getTime()
  const attStatus = (punchTs > startTs + lateMin * 60000) ? 'late' : 'present'

  // ── Upsert attendance record ──────────────────────────────────
  try {
    await db.query(`
      INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, branch_id, manual_entry)
      VALUES (?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        clock_in  = LEAST(clock_in, VALUES(clock_in)),
        clock_out = IF(VALUES(clock_out) IS NOT NULL AND (clock_out IS NULL OR VALUES(clock_out) > clock_out),
                       VALUES(clock_out), clock_out),
        status    = VALUES(status)
    `, [
      employeeId, today,
      earliestPunch,
      punchCount > 1 ? latestPunch : null,
      attStatus, branchId,
    ])
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: 'Attendance save failed: ' + e.message })
  }

  // ── Auto-overtime detection ───────────────────────────────────
  let otCreated = false
  if (punchCount > 1) {
    const endTs    = new Date(`${today}T${workEnd}`).getTime()
    const latestTs = new Date(`${today}T${latestPunch}`).getTime()
    const otSecs   = latestTs - endTs - (otThreshold * 60000)

    if (otSecs > 60000) {
      const otHours = Math.min(otSecs / 3600000, 4)

      // Get hourly rate from basic salary
      let hourly = 0
      try {
        const [empRows] = await db.query(
          'SELECT basic_salary FROM hr_employees WHERE id=?', [employeeId]
        ) as any[][]
        const salary = parseFloat(empRows?.[0]?.basic_salary || 0)
        if (salary > 0) hourly = salary / 26 / 8
      } catch { /* ignore */ }

      const otAmount = Math.round(hourly * 1.5 * otHours * 100) / 100
      const otStatus = autoApprove ? 'approved' : 'pending'

      try {
        await db.query(`
          INSERT INTO hr_overtime_records
            (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
          VALUES (?, ?, ?, '1.5x', ?, 'Auto-detected from kiosk punch', ?)
          ON DUPLICATE KEY UPDATE
            ot_hours = VALUES(ot_hours),
            amount   = VALUES(amount)
        `, [employeeId, today, Math.round(otHours * 100) / 100, otAmount, otStatus])
        otCreated = true
      } catch { /* ignore */ }
    }
  }

  // ── Action label for UI ───────────────────────────────────────
  let action: string
  let message: string
  if (punchCount === 1) {
    action  = 'clock_in'
    message = 'Clocked In'
  } else {
    const endTs    = new Date(`${today}T${workEnd}`).getTime()
    const latestTs = new Date(`${today}T${latestPunch}`).getTime()
    if (latestTs >= endTs) {
      action  = 'clock_out'
      message = 'Clocked Out'
    } else {
      action  = 'returning'
      message = 'Welcome Back'
    }
  }

  // ── Employee name ─────────────────────────────────────────────
  const emp = await queryOne(
    "SELECT CONCAT(first_name,' ',last_name) AS name FROM hr_employees WHERE id=?",
    [employeeId]
  ) as any
  const employeeName = emp?.name || `Employee #${employeeId}`

  return {
    success:       true,
    action,
    message,
    employee_name: employeeName,
    time:          `${today} ${timeOnly}`,
    punch_count:   punchCount,
    clock_in:      earliestPunch,
    clock_out:     punchCount > 1 ? latestPunch : null,
    overtime:      otCreated,
  }
})
