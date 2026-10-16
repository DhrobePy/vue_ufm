import { getDb } from '~/server/utils/db'

/** How much credit the customer holds (what a refund may not exceed). */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  const conn = await getDb().getConnection()
  try {
    const [[c]] = await conn.query<any>(`SELECT name, initial_due FROM customers WHERE id = ?`, [customerId])
    if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
    const [[bal]] = await conn.query<any>(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) b FROM customer_ledger WHERE customer_id = ? AND reference_type <> 'initial_due'`, [customerId])
    const net = Number(c.initial_due ?? 0) + Number(bal.b)
    const [refunds] = await conn.query<any[]>(`SELECT refund_number, refund_date, amount, payment_method FROM customer_refunds WHERE customer_id = ? ORDER BY id DESC LIMIT 10`, [customerId])
    return { name: c.name, credit: Math.max(0, -net), balance: net, refunds }
  } finally { conn.release() }
})
