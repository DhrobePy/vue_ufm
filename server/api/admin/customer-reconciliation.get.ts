import { query } from '~/server/utils/db'

/**
 * GET /api/admin/customer-reconciliation — customers whose STORED balance differs from what their ledger adds up to (the ledger is the truth),
 * plus the history of corrections. Admin / superadmin.
 */
export default defineEventHandler(async () => {
  const mismatches = await query<any>(
    `SELECT c.id, c.name, c.business_name, c.current_balance AS stored,
            COALESCE(l.net, 0) AS ledger, COALESCE(l.n, 0) AS line_count,
            ROUND(c.current_balance - COALESCE(l.net, 0), 2) AS diff
     FROM customers c
     LEFT JOIN (SELECT customer_id, SUM(debit_amount - credit_amount) AS net, COUNT(*) AS n FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
     WHERE ABS(c.current_balance - COALESCE(l.net, 0)) >= 0.5
     ORDER BY ABS(c.current_balance - COALESCE(l.net, 0)) DESC`)
  const history = await query<any>(
    `SELECT r.id, r.customer_id, c.name AS customer, r.old_balance, r.new_balance, r.status, r.reconciled_at, r.reverted_at,
            ub.display_name AS reconciled_by, rb.display_name AS reverted_by
     FROM customer_balance_reconciliations r
     JOIN customers c ON c.id = r.customer_id
     LEFT JOIN users ub ON ub.id = r.reconciled_by_user_id
     LEFT JOIN users rb ON rb.id = r.reverted_by_user_id
     ORDER BY r.id DESC LIMIT 100`)
  const num = (r: any) => ({ ...r, stored: Number(r.stored), ledger: Number(r.ledger), diff: Number(r.diff) })
  return { mismatches: mismatches.map(num), history, checked: Number((await query<any>(`SELECT COUNT(*) n FROM customers`))[0].n) }
})
