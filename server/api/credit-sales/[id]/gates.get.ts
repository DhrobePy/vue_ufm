import { getDb } from '~/server/utils/db'
import { getOrderGateState } from '~/server/utils/creditOrders'

/** Gate state for one order — used by the order view + dispatch page. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const conn = await getDb().getConnection()
  try {
    const gate = await getOrderGateState(conn, id)
    return { ok: true, gate }
  } finally {
    conn.release()
  }
})
