/**
 * GET /api/lookup/employees
 * Employee PICKER (e.g. "collected by" on payment/order forms).
 * Available to ANY authenticated user. Names only — no salaries,
 * positions or HR details (those stay behind the HR module).
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const employees = await query(
    `SELECT id, first_name, last_name
     FROM hr_employees
     WHERE status = 'active' OR status IS NULL
     ORDER BY first_name`,
  ) as any[]

  return { employees }
})
