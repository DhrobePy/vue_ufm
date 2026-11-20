import { query } from '~/server/utils/db'

/** GET /api/accounts/transfer — who can be named as responsible for an internal transfer (legacy `employees` list). */
export default defineEventHandler(async () => {
  const rows = await query<any>(`SELECT id, TRIM(CONCAT(first_name, ' ', COALESCE(last_name, ''))) AS name FROM employees WHERE status IN ('active', 'Active') OR status IS NULL ORDER BY first_name`)
  return { employees: rows }
})
