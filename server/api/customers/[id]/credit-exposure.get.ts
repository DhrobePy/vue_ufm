import { queryOne } from '~/server/utils/db'

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

  return { pending: Number(row?.pending ?? 0) }
})
