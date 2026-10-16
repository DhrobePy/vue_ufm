import { queryOne, getDb } from '~/server/utils/db'
import { getCustomerOutstanding } from '~/server/utils/creditOrders'

// GET /api/customers/:id/credit-exposure
// Returns the customer's pending order exposure (balance_due on orders not yet
// on the ledger — the ledger posts at GOODS ON BOARD, the accounting pivot) so
// the create-order form can show accurate credit utilisation including
// uncommitted commitments without double-counting orders already on the ledger.

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })

  const row = await queryOne<any>(
    `SELECT
       COALESCE((
         SELECT SUM(o.balance_due)
         FROM credit_orders o
         WHERE o.customer_id = ?
           AND o.status IN ('pending_approval','escalated','approved','in_production','ready_to_ship')
       ), 0) AS pending
     FROM dual`,
    [id],
  )

  // Same numbers the server uses to decide escalation: ledger balance + other open orders, against the customer's limit.
  const conn = await getDb().getConnection()
  try {
    const exp = await getCustomerOutstanding(conn, id)
    const [[c]] = await conn.query<any>('SELECT credit_limit FROM customers WHERE id = ?', [id])
    return { pending: exp.pendingExposure, ledger: exp.ledgerOutstanding, limit: Number(c?.credit_limit ?? 0) }
  } finally { conn.release() }

})
