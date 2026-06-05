import { query, queryOne } from '~/server/utils/db'

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid supplier ID' })

  const q        = getQuery(event)
  const dateFrom = (q.date_from as string) || ''
  const dateTo   = (q.date_to   as string) || ''

  // Load supplier first
  const supplier = await queryOne(
    `SELECT id, company_name, contact_person, phone, address, current_balance, credit_limit
     FROM suppliers WHERE id = ?`,
    [id],
  ) as any

  if (!supplier) {
    throw createError({ statusCode: 404, statusMessage: 'Supplier not found' })
  }

  // Try supplier_ledger table (may not exist on all deployments)
  const dateWhere: string[] = [`sl.supplier_id = ?`]
  const dateParams: unknown[] = [id]
  if (dateFrom) { dateWhere.push('sl.transaction_date >= ?'); dateParams.push(dateFrom) }
  if (dateTo)   { dateWhere.push('sl.transaction_date <= ?'); dateParams.push(dateTo) }
  const dw = 'WHERE ' + dateWhere.join(' AND ')

  const [ledgerRows, ledgerStats] = await Promise.all([
    safeQuery(() => query(
      `SELECT sl.id, sl.transaction_date AS date, sl.transaction_type AS type,
              sl.description, sl.reference_number AS ref,
              sl.debit_amount AS debit, sl.credit_amount AS credit, sl.balance
       FROM supplier_ledger sl
       ${dw}
       ORDER BY sl.transaction_date ASC, sl.id ASC
       LIMIT 300`,
      dateParams,
    ) as Promise<any[]>, [] as any[]),

    safeQuery(() => queryOne(
      `SELECT
         COALESCE(SUM(credit_amount), 0) AS total_purchased,
         COALESCE(SUM(debit_amount),  0) AS total_paid
       FROM supplier_ledger sl ${dw}`,
      dateParams,
    ) as Promise<any>, null),
  ])

  // If supplier_ledger has data, return it directly
  if (ledgerRows.length > 0 && ledgerStats) {
    return { supplier, ledger: ledgerRows, stats: ledgerStats }
  }

  // Fallback: synthesise ledger from purchase_orders + payments
  // Apply optional date filters on the synthesised result
  const dateOrderWhere: string[] = ['o.supplier_id = ?']
  const dateOrderParams: unknown[] = [id]
  const datePayWhere: string[] = ['p.supplier_id = ?']
  const datePayParams: unknown[] = [id]

  if (dateFrom) {
    dateOrderWhere.push('o.po_date >= ?'); dateOrderParams.push(dateFrom)
    datePayWhere.push('p.payment_date >= ?'); datePayParams.push(dateFrom)
  }
  if (dateTo) {
    dateOrderWhere.push('o.po_date <= ?'); dateOrderParams.push(dateTo)
    datePayWhere.push('p.payment_date <= ?'); datePayParams.push(dateTo)
  }

  const [orders, payments] = await Promise.all([
    safeQuery(() => query(
      `SELECT o.id, o.po_date AS date,
              CONCAT('Purchase Order: ', o.po_number) AS description,
              o.po_number AS ref,
              o.total_order_value AS credit, 0 AS debit
       FROM purchase_orders_adnan o
       WHERE ${dateOrderWhere.join(' AND ')}
       ORDER BY o.po_date ASC LIMIT 200`,
      dateOrderParams,
    ) as Promise<any[]>, [] as any[]),

    safeQuery(() => query(
      `SELECT p.id, p.payment_date AS date,
              CASE
                WHEN p.payment_type = 'contra'           THEN CONCAT('Contra Offset — ', COALESCE(p.reference_number, p.payment_voucher_number))
                WHEN p.payment_type = 'advance'          THEN CONCAT('Advance Payment — ', p.payment_voucher_number)
                WHEN p.payment_type = 'against_delivery' THEN CONCAT('Delivery Expense — ', p.payment_voucher_number)
                ELSE CONCAT('Payment — ', p.payment_method)
              END AS description,
              COALESCE(p.payment_voucher_number, CONCAT('PMT-', p.id)) AS ref,
              0 AS credit,
              COALESCE(p.amount_paid, 0) AS debit
       FROM purchase_payments_adnan p
       WHERE ${datePayWhere.join(' AND ')}
       ORDER BY p.payment_date ASC LIMIT 200`,
      datePayParams,
    ) as Promise<any[]>, [] as any[]),
  ])

  const combined = [...orders, ...payments].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let running = 0
  for (const row of combined) {
    running += Number(row.credit) - Number(row.debit)
    row.balance = running
  }

  return {
    supplier,
    ledger: combined,
    stats: {
      total_purchased: orders.reduce((s: number, o: any) => s + Number(o.credit ?? 0), 0),
      total_paid:      payments.reduce((s: number, p: any) => s + Number(p.debit ?? 0), 0),
    },
  }
})
