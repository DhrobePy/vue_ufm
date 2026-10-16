import { query, queryOne } from '~/server/utils/db'

/** POST /api/customers/:id/notes  { note } — internal note on a customer (any signed-in user who can open the profile). */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const note = String((await readBody(event))?.note ?? '').trim().slice(0, 2000)
  if (!id || !note) throw createError({ statusCode: 400, statusMessage: 'A note is required' })
  if (!(await queryOne('SELECT id FROM customers WHERE id = ?', [id]))) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  await query(`INSERT INTO customer_notes (customer_id, note, created_by_user_id) VALUES (?, ?, ?)`, [id, note, Number(session.user.id)])
  return { ok: true }
})
