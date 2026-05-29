import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const departments = await query('SELECT * FROM hr_departments ORDER BY name')
  return { departments }
})
