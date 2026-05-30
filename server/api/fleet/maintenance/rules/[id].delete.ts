import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  await query(`DELETE FROM preventive_maintenance_rules WHERE id = ?`, [id])
  return { ok: true }
})
