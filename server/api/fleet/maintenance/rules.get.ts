import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rules = await query(
    `SELECT * FROM preventive_maintenance_rules ORDER BY rule_name`,
    [],
  )
  return { rules }
})
