import { query } from '~/server/utils/db'
import { requireAction } from '~/server/utils/permissions'

/**
 * GET /api/ledger/review?status=review|kept|all&reason=&customer_id=&q=&page=1&per=50
 * Ledger lines waiting for a human decision, with each customer's balance now and "without the flagged lines"
 * so the reviewer can see what clearing them would do.
 */
export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'customers', page: 'list', action: 'review_ledger', roleFallback: [], explicit: true },
    'Only admin, or a user granted "Review Ledger Lines", may open the review list')
  const q = getQuery(event)
  const status = ['review', 'kept', 'all'].includes(String(q.status)) ? String(q.status) : 'review'
  const page = Math.max(1, Number(q.page) || 1), per = Math.min(200, Math.max(10, Number(q.per) || 50))

  const where: string[] = [status === 'all' ? `l.review_status IN ('review','kept')` : 'l.review_status = ?']
  const params: any[] = status === 'all' ? [] : [status]
  if (q.reason) { where.push('l.review_reason = ?'); params.push(String(q.reason)) }
  if (q.customer_id !== undefined && q.customer_id !== '') { where.push('l.customer_id = ?'); params.push(Number(q.customer_id)) }
  if (q.q) { where.push('(c.name LIKE ? OR l.description LIKE ? OR l.invoice_number LIKE ?)'); params.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`) }
  const W = where.join(' AND ')

  const [rows, [tot], byReason, perCustomer] = await Promise.all([
    query<any>(
      `SELECT l.id, l.customer_id, COALESCE(c.name, '(no customer)') customer, DATE_FORMAT(l.transaction_date, '%Y-%m-%d') date, l.transaction_type type,
              l.reference_type, l.reference_id, l.invoice_number ref, l.description, l.debit_amount debit, l.credit_amount credit, l.journal_entry_id,
              l.review_status, l.review_reason, l.review_note, l.reviewed_at, u.display_name reviewed_by,
              COALESCE(CASE WHEN l.reference_type IN ('credit_order','credit_orders') THEN l.reference_id END) linked_order_id
       FROM customer_ledger l LEFT JOIN customers c ON c.id = l.customer_id LEFT JOIN users u ON u.id = l.reviewed_by_user_id
       WHERE ${W} ORDER BY customer, l.transaction_date, l.id LIMIT ? OFFSET ?`, [...params, per, (page - 1) * per]),
    query<any>(`SELECT COUNT(*) n, COALESCE(SUM(l.debit_amount - l.credit_amount), 0) net FROM customer_ledger l LEFT JOIN customers c ON c.id = l.customer_id WHERE ${W}`, params),
    query<any>(`SELECT l.review_reason reason, COUNT(*) n, COALESCE(SUM(l.debit_amount - l.credit_amount), 0) net FROM customer_ledger l WHERE l.review_status = 'review' GROUP BY l.review_reason ORDER BY n DESC`),
    query<any>(
      `SELECT l.customer_id id, COALESCE(c.name, '(no customer)') name, COUNT(*) flagged,
              SUM(l.debit_amount - l.credit_amount) flagged_net,
              (SELECT COALESCE(SUM(x.debit_amount - x.credit_amount), 0) FROM customer_ledger x WHERE x.customer_id = l.customer_id) balance_now
       FROM customer_ledger l LEFT JOIN customers c ON c.id = l.customer_id
       WHERE l.review_status = 'review' GROUP BY l.customer_id, c.name ORDER BY ABS(SUM(l.debit_amount - l.credit_amount)) DESC LIMIT 400`),
  ])
  const customers = perCustomer.map((c: any) => ({ ...c, flagged_net: Number(c.flagged_net), balance_now: Number(c.balance_now), balance_without_flagged: Number(c.balance_now) - Number(c.flagged_net) }))
  const pending = await query<any>(`SELECT COUNT(*) n FROM customer_ledger WHERE review_status = 'review'`)
  return { rows, total: Number(tot.n), net: Number(tot.net), page, per, byReason, customers, pending: Number(pending[0].n) }
})
