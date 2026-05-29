import { query, getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action } = body ?? {}

  if (action === 'create') {
    const { employee_id, ot_date, ot_hours, rate_type, reason } = body
    if (!employee_id || !ot_date) throw createError({ statusCode: 400, statusMessage: 'employee_id and ot_date required' })

    const [set] = await query('SELECT * FROM hr_overtime_settings WHERE id = 1') as any[]
    const rateMap: Record<string, number> = { '1.5x': set?.normal_rate || 1.5, '2x': set?.holiday_rate || 2, 'flat': 1 }
    const rate = rateMap[rate_type || '1.5x'] || 1.5

    const [empRow] = await query(`
      SELECT e.base_salary FROM hr_employees e WHERE e.id = ?
    `, [employee_id]) as any[]
    const hourlyRate = (Number(empRow?.base_salary) || 0) / 30 / 8
    const hours = Number(ot_hours) || 0
    const amount = Math.round(hourlyRate * rate * hours * 100) / 100

    await getDb().query(
      `INSERT INTO hr_overtime_records (employee_id, ot_date, ot_hours, rate_type, amount, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, ot_date, hours, rate_type || '1.5x', amount, reason || null,
       set?.auto_approve ? 'approved' : 'pending']
    )
    return { ok: true, amount, message: 'Overtime recorded.' }
  }

  if (action === 'update_status') {
    const { id, status } = body
    if (!id || !['approved', 'rejected', 'paid', 'pending'].includes(status))
      throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    await query('UPDATE hr_overtime_records SET status = ? WHERE id = ?', [status, id])
    return { ok: true, message: `Overtime ${status}.` }
  }

  if (action === 'delete') {
    const { id } = body
    await query('DELETE FROM hr_overtime_records WHERE id = ?', [id])
    return { ok: true, message: 'Record deleted.' }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
