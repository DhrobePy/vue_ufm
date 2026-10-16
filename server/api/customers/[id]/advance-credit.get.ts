import { getDb } from '~/server/utils/db'
import { getAdvanceCredit, suggestAllotment } from '~/server/utils/advanceCredit'

/** A customer's unallotted advance money, their open orders (oldest first), the opening due, and a suggested plan. */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  if (!customerId) throw createError({ statusCode: 400, statusMessage: 'Invalid customer' })
  const q = getQuery(event)
  const strategy = q.strategy === 'opening_first' ? 'opening_first' : 'orders_first'
  const onlyOrderId = q.order_id ? Number(q.order_id) : undefined
  const conn = await getDb().getConnection()
  try {
    const credit = await getAdvanceCredit(conn, customerId)
    return { ...credit, strategy, suggestion: suggestAllotment(credit, strategy, { onlyOrderId }) }
  } finally { conn.release() }
})
