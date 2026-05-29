import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const holidays = await query('SELECT * FROM hr_holidays ORDER BY holiday_date')
  return { holidays }
})
