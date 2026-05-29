import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid supplier ID' })

  const q        = getQuery(event)
  const dateFrom = (q.date_from as string) || ''
  const dateTo   = (q.date_to   as string) || ''

  const where: string[] = ['sl.supplier_id = ?']
  const params: unknown[] = [id]

  if (dateFrom) { where.push('sl.transaction_date >= ?'); params.push(dateFrom) }
  if (dateTo)   { where.push('sl.transaction_date <= ?'); params.push(dateTo) }

  const w = 'WHERE ' + where.join(' AND ')

  const [supplier, ledger, stats] = await Promise.all([
    queryOne(
      `SELECT id, company_name, contact_person, phone, address, current_balance, credit_limit
       FROM suppliers WHERE id = ?`,
      [id],
    ) as any,

    query(
      `SELECT sl.id, sl.transaction_date AS date, sl.transaction_type AS type,
              sl.description, sl.reference_number AS ref,
              sl.debit_amount AS debit, sl.credit_amount AS credit, sl.balance
       FROM supplier_ledger sl
       ${w}
       ORDER BY sl.transaction_date ASC, sl.id ASC
       LIMIT 300`,
      params,
    ) as any[],

    queryOne(
      `SELECT
         COALESCE(SUM(credit_amount), 0) AS total_purchased,
         COALESCE(SUM(debit_amount),  0) AS total_paid
       FROM supplier_ledger sl ${w}`,
      params,
    ) as any,
  ])

  if (!supplier) {
    // Fall back to synthesizing from purchase_orders + payments
    const [orders, payments] = await Promise.all([
      query(
        `SELECT o.id, o.po_date AS date, CONCAT('PO: ', o.po_number) AS description,
                o.po_number AS ref,
                o.total_order_value AS credit, 0 AS debit
         FROM purchase_orders_adnan o
         WHERE o.supplier_id = ?
         ORDER BY o.po_date ASC LIMIT 100`,
        [id],
      ) as any[],
      query(
        `SELECT p.id, p.payment_date AS date,
                CONCAT('Payment — ', p.payment_method) AS description,
                p.payment_voucher_number AS ref,
                0 AS credit, p.amount_paid AS debit
         FROM purchase_payments_adnan p
         WHERE p.supplier_id = ?
         ORDER BY p.payment_date ASC LIMIT 100`,
        [id],
      ) as any[],
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
      supplier: { id, company_name: 'Unknown Supplier', phone: '—', address: '—', current_balance: running, credit_limit: 0 },
      ledger: combined,
      stats: {
        total_purchased: orders.reduce((s: number, o: any) => s + Number(o.credit), 0),
        total_paid:      payments.reduce((s: number, p: any) => s + Number(p.debit), 0),
      },
    }
  }

  return { supplier, ledger, stats }
})
