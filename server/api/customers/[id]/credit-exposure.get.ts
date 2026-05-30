import { queryOne } from '~/server/utils/db'

// GET /api/customers/:id/credit-exposure
// Returns the customer's pending order exposure (balance_due on orders not yet
// on the ledger, i.e. pre-delivery states) so the create-order form can show
// accurate credit utilisation including uncommitted commitments.

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })

  const row = await queryOne<any>(
    `SELECT
       COALESCE((
         SELECT SUM(o.balance_due)
         FROM credit_orders o
         WHERE o.customer_id = ?
           AND o.status IN ('pending_approval','approved','in_production','ready_to_ship','shipped')
       ), 0) AS pending
     FROM dual`,
    [id],
  )

  return { pending: Number(row?.pending ?? 0) }
})
