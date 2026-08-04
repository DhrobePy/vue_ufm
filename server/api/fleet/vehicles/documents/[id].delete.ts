import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid document ID' })

  const result = await query(`DELETE FROM vehicle_documents WHERE id = ?`, [id]) as any
  if (result.affectedRows === 0) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

  return { ok: true }
})
