import { query } from '~/server/utils/db'

/**
 * GET /api/pos/customers/:id/ledger — merges EVERY POS sale (cash or credit,
 * for full purchase history visibility) with pos_customer_ledger (payments/
 * adjustments, the rows that actually move the balance) into one
 * chronological timeline. Cash sales show as informational rows only.
 * Same fix the legacy app made after a cash-only customer's real purchase
 * history was invisible on a ledger that only ever logged credit activity.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const customerId = Number(getRouterParam(event, 'id'))
  if (!customerId) throw createError({ statusCode: 400, statusMessage: 'Invalid customer' })

  const [customer, sales, ledger] = await Promise.all([
    query<any>(`SELECT id, name, business_name, phone_number FROM customers WHERE id = ?`, [customerId]),
    query<any>(
      `SELECT id, order_number, order_date, total_amount, cash_amount, credit_amount, payment_status
       FROM orders WHERE customer_id = ? AND order_type = 'POS' ORDER BY order_date DESC LIMIT 200`,
      [customerId]),
    query<any>(
      `SELECT l.*, u.display_name AS created_by_name FROM pos_customer_ledger l
       LEFT JOIN users u ON u.id = l.created_by_user_id
       WHERE l.customer_id = ? ORDER BY l.transaction_date DESC, l.id DESC LIMIT 200`,
      [customerId]),
  ])
  if (!customer.length) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  const [[balanceRow]] = await query<any>(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM pos_customer_ledger WHERE customer_id = ?`, [customerId],
  ) as any[]

  const timeline = [
    ...sales.map((s: any) => ({
      kind: 'sale', date: s.order_date, order_number: s.order_number,
      total_amount: Number(s.total_amount), cash_amount: Number(s.cash_amount), credit_amount: Number(s.credit_amount),
      payment_status: s.payment_status, balance_impact: Number(s.credit_amount) > 0,
    })),
    ...ledger.filter((l: any) => l.transaction_type !== 'sale').map((l: any) => ({
      kind: l.transaction_type, date: l.transaction_date, description: l.description,
      debit_amount: Number(l.debit_amount), credit_amount: Number(l.credit_amount),
      reference_number: l.reference_number, created_by_name: l.created_by_name,
    })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { customer: customer[0], balance: Number(balanceRow?.bal ?? 0), timeline }
})
