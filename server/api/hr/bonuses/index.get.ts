import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q       = getQuery(event)
  const batchId = q.batchId ? Number(q.batchId) : null

  if (batchId) {
    const batch = await queryOne('SELECT * FROM hr_bonus_batches WHERE id = ?', [batchId])
    const employees = await query(`
      SELECT eb.*, e.first_name, e.last_name FROM hr_employee_bonuses eb
      JOIN hr_employees e ON eb.employee_id = e.id
      WHERE eb.batch_id = ? ORDER BY e.first_name
    `, [batchId])
    return { batch, employees }
  }

  const batches = await query('SELECT * FROM hr_bonus_batches ORDER BY created_at DESC LIMIT 100')
  return { batches }
})
