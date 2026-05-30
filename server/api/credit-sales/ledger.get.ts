import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q           = getQuery(event)
  const customerId  = q.customer_id ? Number(q.customer_id) : null
  const dateFrom    = (q.date_from as string) || null
  const dateTo      = (q.date_to   as string) || null

  // Build WHERE for ledger entries
  const where: string[] = []
  const params: unknown[] = []

  if (customerId) { where.push('l.customer_id = ?');   params.push(customerId) }
  if (dateFrom)   { where.push('l.entry_date >= ?');    params.push(dateFrom) }
  if (dateTo)     { where.push('l.entry_date <= ?');    params.push(dateTo) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  // Try the customer_ledger table; fall back to synthesizing from orders+payments
  let ledger: any[] = []
  let totalDebit  = 0
  let totalCredit = 0

  try {
    ledger = await query(
      `SELECT l.id, l.entry_date AS date, l.entry_type AS type,
              l.reference_number AS ref,
              l.description,
              l.debit_amount AS debit, l.credit_amount AS credit,
              l.running_balance AS balance,
              c.name AS customer_name
       FROM customer_ledger l
       JOIN customers c ON c.id = l.customer_id
       ${w}
       ORDER BY l.entry_date DESC, l.id DESC
       LIMIT 200`,
      params,
    ) as any[]

    const agg = await queryOne(
      `SELECT COALESCE(SUM(debit_amount),0) AS total_debit,
              COALESCE(SUM(credit_amount),0) AS total_credit
       FROM customer_ledger l ${w}`,
      params,
    ) as any
    totalDebit  = Number(agg?.total_debit  ?? 0)
    totalCredit = Number(agg?.total_credit ?? 0)
  } catch {
    // customer_ledger table may not exist — synthesize from credit_orders + customer_payments
    const orderWhere: string[] = []
    const orderParams: unknown[] = []
    if (customerId) { orderWhere.push('o.customer_id = ?'); orderParams.push(customerId) }
    if (dateFrom)   { orderWhere.push('o.order_date >= ?'); orderParams.push(dateFrom) }
    if (dateTo)     { orderWhere.push('o.order_date <= ?'); orderParams.push(dateTo) }

    const payWhere: string[] = []
    const payParams: unknown[] = []
    if (customerId) { payWhere.push('p.customer_id = ?'); payParams.push(customerId) }
    if (dateFrom)   { payWhere.push('p.payment_date >= ?'); payParams.push(dateFrom) }
    if (dateTo)     { payWhere.push('p.payment_date <= ?'); payParams.push(dateTo) }

    const [orders, payments] = await Promise.all([
      query(
        `SELECT o.id, o.order_date AS date, 'Sale Invoice' AS type,
                o.order_number AS ref,
                CONCAT('Order ', o.order_number) AS description,
                o.total_amount AS debit, 0 AS credit, 0 AS balance,
                c.name AS customer_name
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         ${orderWhere.length ? 'WHERE ' + orderWhere.join(' AND ') : ''}
         ORDER BY o.order_date DESC
         LIMIT 100`,
        orderParams,
      ) as any[],
      query(
        `SELECT p.id, p.payment_date AS date, 'Payment Received' AS type,
                COALESCE(p.reference_number, CONCAT('PMT-',p.id)) AS ref,
                CONCAT('Payment — ', p.payment_method) AS description,
                0 AS debit, p.amount AS credit, 0 AS balance,
                c.name AS customer_name
         FROM customer_payments p
         JOIN customers c ON c.id = p.customer_id
         ${payWhere.length ? 'WHERE ' + payWhere.join(' AND ') : ''}
         ORDER BY p.payment_date DESC
         LIMIT 100`,
        payParams,
      ) as any[],
    ])

    ledger = [...orders, ...payments].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 200)

    // Running balance (approximate: latest first, so reverse)
    let running = 0
    const reversed = [...ledger].reverse()
    for (const row of reversed) {
      running += Number(row.debit) - Number(row.credit)
      row.balance = running
    }
    reversed.reverse()
    ledger = reversed

    totalDebit  = orders.reduce((s: number, r: any) => s + Number(r.debit), 0)
    totalCredit = payments.reduce((s: number, r: any) => s + Number(r.credit), 0)
  }

  // Customer list for the filter dropdown
  const customers = await query(
    `SELECT id, name FROM customers WHERE customer_type = 'Credit' ORDER BY name LIMIT 200`,
  ) as any[]

  return { ledger, totalDebit, totalCredit, balance: totalDebit - totalCredit, customers }
})
