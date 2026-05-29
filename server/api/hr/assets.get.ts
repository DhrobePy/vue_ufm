import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const assets = await query('SELECT * FROM hr_assets ORDER BY name')
  return { assets }
})
