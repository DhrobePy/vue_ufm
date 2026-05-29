/**
 * Universal ADMS / iClock Protocol Handler
 * Supports: ZKTeco, eSSL, FingerTec, Realand, Anviz, Hikvision (iClock mode), Dahua (ATDM)
 *
 * Device setup:
 *   Menu → Cloud / ADMS / Server Settings
 *     Server Address : yourdomain.com
 *     Server Port    : 80 (or 443)
 *     URL Path       : /api/device/adms
 *
 * Protocol:
 *   1. GET ?SN=xxx          → Handshake → return device config (plain text)
 *   2. POST ?SN=xxx&table=ATTLOG → Push attendance → return "OK: N"
 *   3. GET ?SN=xxx (getrequest) → Command poll → return empty
 */

import { getDb, query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // ADMS always responds with plain text
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const method = getMethod(event)
  const qp     = getQuery(event)
  const url    = getRequestURL(event)
  const sn     = String(qp.SN || qp.sn || '').trim()
  const table  = String(qp.table || '').toUpperCase()

  // Try to extract SN from body for Hikvision variants
  let serialNo = sn
  if (!serialNo && method === 'POST') {
    const raw = await readRawBody(event) || ''
    const m = raw.match(/SN=([A-Za-z0-9\-_]+)/i)
    if (m) serialNo = m[1]
  }

  if (!serialNo) {
    return 'ERROR: No SN'
  }

  // Auto-register / update device last-seen
  const db = getDb()
  try {
    const pushver = qp.pushver as string | undefined
    await db.query(`
      INSERT INTO hr_biometric_devices (serial_no, firmware_version, status, last_seen)
      VALUES (?, ?, 'online', NOW())
      ON DUPLICATE KEY UPDATE
        status = 'online', last_seen = NOW(),
        firmware_version = COALESCE(?, firmware_version)
    `, [serialNo, pushver || null, pushver || null])
  } catch { /* ignore */ }

  // Command poll — device asking for queued commands (return empty)
  if (url.pathname.includes('getrequest') || qp.getrequest !== undefined) {
    return ''
  }

  // ── POST: device pushing attendance data ──────────────────────────────────
  if (method === 'POST' && table === 'ATTLOG') {
    const rawBody = await readRawBody(event) || ''
    const count = await processAttlog(serialNo, rawBody, db)

    // Update device punch counter
    if (count > 0) {
      try {
        await db.query(
          'UPDATE hr_biometric_devices SET total_records = total_records + ?, last_sync = NOW() WHERE serial_no = ?',
          [count, serialNo]
        )
      } catch { /* ignore */ }
    }

    return `OK: ${count}`
  }

  // ── GET: handshake ────────────────────────────────────────────────────────
  if (method === 'GET') {
    // Get timezone from settings
    let tz = 6  // Default Asia/Dhaka UTC+6
    try {
      const tzRow = await queryOne("SELECT value FROM hr_settings WHERE name = 'timezone'") as any
      const tzMap: Record<string, number> = { 'Asia/Dhaka': 6, 'Asia/Karachi': 5, 'Asia/Kolkata': 5, 'UTC': 0 }
      if (tzRow?.value) tz = tzMap[tzRow.value] ?? 6
    } catch { /* ignore */ }

    return [
      `GET OPTION FROM: ${serialNo}`,
      'ATTLOGStamp=0',
      'OperLogStamp=9999',
      'ErrorDelay=30',
      'Delay=1',
      'TransTimes=00:00;14:05',
      'TransInterval=1',
      'TransFlag=TransData AttLog OpLog',
      `TimeZone=${tz}`,
      'Realtime=1',
      'Encrypt=None',
      '',
    ].join('\r\n')
  }

  return ''
})

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse ZKTeco/ADMS ATTLOG format and store in hr_device_punch_log + hr_attendance.
 * Format per line: PIN\tDateTime\tVerifyMode\tInOut\tWorkCode\tReserved
 * Example: 1234\t2025-01-15 08:05:23\t1\t0\t0\t
 */
async function processAttlog(sn: string, raw: string, db: any): Promise<number> {
  const lines = raw.trim().split(/\r?\n/)
  let count = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parts = trimmed.split('\t')
    if (parts.length < 2) continue

    let pin         = parts[0]?.trim()
    let datetime    = parts[1]?.trim()
    const verifyType = parseInt(parts[2] || '1')
    const inout      = parseInt(parts[3] || '0')
    const workCode   = parseInt(parts[4] || '0')

    if (!pin || !datetime) continue

    // Normalize datetime format (some devices use 2025/01/15)
    datetime = datetime.replace(/\//g, '-')
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) continue

    // Match employee
    const empId = await findEmployee(pin, db)

    // Insert into punch log (unique key deduplicates)
    try {
      await db.query(`
        INSERT IGNORE INTO hr_device_punch_log
          (device_serial, pin, employee_id, punch_time, punch_type, verify_type, work_code, raw_line)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [sn, pin, empId, datetime, inout, verifyType, workCode, trimmed])
      count++

      if (empId) {
        await syncAttendance(empId, datetime, inout, sn, db)
      }
    } catch { /* duplicate — skip */ }
  }

  return count
}

/** Match device PIN → hr_employees.id */
async function findEmployee(pin: string, db: any): Promise<number | null> {
  // 1. Match by explicit device_pin mapping
  try {
    const [rows] = await db.query(
      "SELECT id FROM hr_employees WHERE device_pin = ? AND status = 'active' LIMIT 1",
      [pin]
    ) as any[][]
    if (rows?.length) return rows[0].id
  } catch { /* ignore */ }

  // 2. Fall back to employee id = PIN (numeric match)
  if (/^\d+$/.test(pin)) {
    try {
      const [rows] = await db.query(
        "SELECT id FROM hr_employees WHERE id = ? AND status = 'active' LIMIT 1",
        [parseInt(pin)]
      ) as any[][]
      if (rows?.length) return rows[0].id
    } catch { /* ignore */ }
  }

  return null
}

/**
 * Create / update hr_attendance from a device punch.
 * Multi-punch: clock_in = MIN punch, clock_out = MAX punch for the day.
 * Auto-generates overtime record if punch is past work_end.
 */
async function syncAttendance(empId: number, datetime: string, inout: number, sn: string, db: any): Promise<void> {
  const date = datetime.slice(0, 10)
  const time = datetime.slice(11, 19)

  // Get device branch
  let branchId: number | null = null
  try {
    const [rows] = await db.query(
      'SELECT branch_id FROM hr_biometric_devices WHERE serial_no = ?',
      [sn]
    ) as any[][]
    branchId = rows?.[0]?.branch_id || null
  } catch { /* ignore */ }

  // Get work settings
  let workStart   = '09:00:00'
  let workEnd     = '18:00:00'
  let lateMinutes = 15
  let otThreshold = 0
  let autoApprove = 0

  try {
    const [settings] = await db.query(
      "SELECT name, value FROM hr_settings WHERE name IN ('work_start','work_end','late_threshold','ot_threshold')"
    ) as any[][]
    for (const s of settings || []) {
      if (s.name === 'work_start')     workStart   = s.value.length === 5 ? s.value + ':00' : s.value
      if (s.name === 'work_end')       workEnd     = s.value.length === 5 ? s.value + ':00' : s.value
      if (s.name === 'late_threshold') lateMinutes = parseInt(s.value)
      if (s.name === 'ot_threshold')   otThreshold = parseInt(s.value)
    }
    const [otSettings] = await db.query(
      'SELECT auto_approve FROM hr_overtime_settings WHERE id = 1'
    ) as any[][]
    autoApprove = parseInt(otSettings?.[0]?.auto_approve || '0')
  } catch { /* use defaults */ }

  // Record individual punch in punches table
  try {
    await db.query(`
      INSERT IGNORE INTO hr_attendance_punches (employee_id, date, punch_time, source, device_serial)
      VALUES (?, ?, ?, 'device', ?)
    `, [empId, date, time, sn])
  } catch { /* ignore */ }

  // Get min/max punches for the day
  let earliest = time
  let latest: string | null = null
  let punchCount = 1

  try {
    const [agg] = await db.query(`
      SELECT MIN(punch_time) AS earliest, MAX(punch_time) AS latest, COUNT(*) AS cnt
      FROM hr_attendance_punches
      WHERE employee_id = ? AND date = ?
    `, [empId, date]) as any[][]

    if (agg?.[0]?.cnt) {
      earliest   = agg[0].earliest
      latest     = agg[0].cnt > 1 ? agg[0].latest : null
      punchCount = parseInt(agg[0].cnt)
    }
  } catch {
    // Fallback: use inout flag
    if (inout === 1) { latest = time }
    else             { earliest = time }
  }

  // Determine status
  const punchTs = new Date(`${date}T${earliest}`).getTime()
  const startTs = new Date(`${date}T${workStart}`).getTime()
  const status  = (punchTs > startTs + lateMinutes * 60000) ? 'late' : 'present'

  // Upsert attendance
  try {
    await db.query(`
      INSERT INTO hr_attendance (employee_id, date, clock_in, clock_out, status, branch_id, manual_entry)
      VALUES (?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        clock_in  = LEAST(clock_in, VALUES(clock_in)),
        clock_out = IF(VALUES(clock_out) IS NOT NULL AND (clock_out IS NULL OR VALUES(clock_out) > clock_out),
                       VALUES(clock_out), clock_out),
        status    = VALUES(status)
    `, [empId, date, earliest, latest, status, branchId])
  } catch { /* ignore */ }

  // Auto-overtime detection
  if (punchCount >= 2 && latest) {
    try {
      const endTs    = new Date(`${date}T${workEnd}`).getTime()
      const latestTs = new Date(`${date}T${latest}`).getTime()
      const otSecs   = latestTs - endTs - (otThreshold * 60000)

      if (otSecs > 60000) {  // more than 1 minute OT
        const otHours  = Math.min(otSecs / 3600000, 4)
        const otStatus = autoApprove ? 'approved' : 'pending'

        await db.query(`
          INSERT INTO hr_overtime_records
            (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
          VALUES (?, ?, ?, '1.5x', 0, 'Auto-detected from device punch', ?)
          ON DUPLICATE KEY UPDATE
            ot_hours = VALUES(ot_hours)
        `, [empId, date, Math.round(otHours * 100) / 100, otStatus])
      }
    } catch { /* ignore */ }
  }
}
