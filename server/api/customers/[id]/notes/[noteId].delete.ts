import { query, queryOne } from '~/server/utils/db'

/** DELETE /api/customers/:id/notes/:noteId — the author, or an admin. Status-change entries are permanent. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const noteId = Number(getRouterParam(event, 'noteId'))
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const isAdmin = ['admin', 'superadmin'].includes(String(session.user.role ?? '').toLowerCase())
  const n = await queryOne<any>('SELECT id, kind, created_by_user_id FROM customer_notes WHERE id = ? AND customer_id = ?', [noteId, id])
  if (!n) throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  if (n.kind === 'status') throw createError({ statusCode: 409, statusMessage: 'Status history cannot be deleted' })
  if (!isAdmin && Number(n.created_by_user_id) !== Number(session.user.id))
    throw createError({ statusCode: 403, statusMessage: 'You can only delete your own notes' })
  await query('DELETE FROM customer_notes WHERE id = ?', [noteId])
  return { ok: true }
})
