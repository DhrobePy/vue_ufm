import { getDb } from '~/server/utils/db'

/**
 * GET /api/trading/sales/:id/invoice — printable single-line commodity
 * invoice (spec: trading/commodity_invoice.php), previously unported.
 * "Previous Account Due" mirrors the legacy calc exactly: sum of
 * customer_ledger rows before this sale's own ledger row if any exist,
 * else fall back to customers.initial_due (pre-ledger legacy customers).
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const conn = await getDb().getConnection()
  try {
    const [[sale]] = await conn.query<any>(
      `SELECT cs.*, c.name AS customer_name, c.phone_number AS customer_phone,
              c.business_address, c.business_name,
              pc.name AS commodity_name, pc.unit, b.name AS branch_name, b.address AS branch_address
       FROM commodity_sales cs
       JOIN customers c ON c.id = cs.customer_id
       JOIN purchase_commodities pc ON pc.id = cs.commodity_id
       JOIN branches b ON b.id = cs.branch_id
       WHERE cs.id = ?`, [id],
    )
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Sale not found' })

    const [[agg]] = await conn.query<any>(
      `SELECT COALESCE(SUM(debit_amount),0) AS td, COALESCE(SUM(credit_amount),0) AS tc
       FROM customer_ledger
       WHERE customer_id = ?
         AND id < (SELECT MIN(id) FROM customer_ledger WHERE reference_type = 'commodity_sales' AND reference_id = ?)`,
      [sale.customer_id, id],
    )
    const [[custInit]] = await conn.query<any>(`SELECT initial_due FROM customers WHERE id = ?`, [sale.customer_id])
    const td = Number(agg?.td ?? 0)
    const tc = Number(agg?.tc ?? 0)
    const previousDue = (td > 0 || tc > 0) ? (td - tc) : Number(custInit?.initial_due ?? 0)

    return { sale, previous_due: previousDue }
  } finally {
    conn.release()
  }
})
