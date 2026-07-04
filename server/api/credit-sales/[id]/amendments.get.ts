import { query } from '~/server/utils/db'

/** All amendments for one order, newest first. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const amendments = await query(
    `SELECT a.*, ru.display_name AS requested_by_name, du.display_name AS decided_by_name
     FROM order_amendments a
     LEFT JOIN users ru ON ru.id = a.requested_by
     LEFT JOIN users du ON du.id = a.decided_by
     WHERE a.order_id = ?
     ORDER BY a.id DESC`,
    [id],
  )
  return { amendments }
})
