import { query } from '~/server/utils/db'

/**
 * The Chairman's Report Center — 14 date-ranged reports (legacy admin/chairman_reports.php). Each builder returns { cols, rows } so the screen,
 * the Excel/CSV export and the printed PDF are always the same table.
 * Customer balances use the ledger total (never the cached column); receivables use the same age buckets as the Ageing Report.
 */
export type Col = { key: string; label: string; fmt?: 'money' | 'qty'; sum?: boolean; align?: 'left' | 'right' | 'center' }
export type Built = { cols: Col[]; rows: Record<string, any>[]; note?: string }
type P = { from: string; to: string; branch: number }

const M = (key: string, label: string, sum = true): Col => ({ key, label, fmt: 'money', sum })
const T = (key: string, label: string): Col => ({ key, label })
const live = 'cp.reversed_at IS NULL'
const day = (v: any) => (v ? String(v).slice(0, 10) : '')

export const REPORT_TYPES: Record<string, string> = {
  completed_sales: 'Completed Sales', receivables: 'Receivables', customer_wise: 'Customer-wise Summary', collections: 'Collections',
  products_sold: 'Products Sold', user_actions: 'User-wise Actions', expenses: 'Expenses', amendments: 'Modifications & Amendments',
  transports: 'Transports', exceptions: 'Exceptions & Corrections', daily_reconciliation: 'Day-wise Reconciliation',
  purchase_orders: 'Purchase Orders', goods_received: 'Goods Received (GRN)', supplier_payments: 'Supplier Payments',
}

export async function buildChairmanReport(type: string, p: P): Promise<Built> {
  const bco = p.branch ? ` AND co.assigned_branch_id = ${Number(p.branch)}` : ''
  const bev = p.branch ? ` AND ev.branch_id = ${Number(p.branch)}` : ''
  switch (type) {
    case 'completed_sales': {
      const rows = await query<any>(
        `SELECT COALESCE(DATE(cos.delivered_date), co.order_date) AS date, co.order_number, c.name AS customer, b.name AS factory,
                p.base_name AS product, COALESCE(pv.weight_variant,'') AS variant, coi.quantity AS qty, coi.unit_price AS price, coi.line_total AS line_total,
                co.total_amount AS order_total, co.amount_paid AS paid, co.balance_due AS due, cos.truck_number AS truck, cos.driver_name AS driver
         FROM credit_orders co JOIN customers c ON c.id = co.customer_id
         LEFT JOIN branches b ON b.id = co.assigned_branch_id LEFT JOIN credit_order_shipping cos ON cos.order_id = co.id
         JOIN credit_order_items coi ON coi.order_id = co.id JOIN products p ON p.id = coi.product_id LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE co.status = 'delivered' AND COALESCE(DATE(cos.delivered_date), co.order_date) BETWEEN ? AND ? ${bco}
         ORDER BY COALESCE(cos.delivered_date, co.order_date), co.order_number, coi.id`, [p.from, p.to])
      // order-level amounts shown once per order (on its first line) so totals add up
      const seen = new Set<string>()
      return { cols: [T('date', 'Date'), T('order_number', 'Order #'), T('customer', 'Customer'), T('factory', 'Factory'), T('product', 'Product'), T('variant', 'Variant'), { key: 'qty', label: 'Qty', fmt: 'qty', sum: true }, M('price', 'Unit price ৳', false), M('line_total', 'Line total ৳'), M('order_total', 'Order total ৳'), M('paid', 'Paid ৳'), M('due', 'Due ৳'), T('truck', 'Truck'), T('driver', 'Driver')],
        rows: rows.map(r => { const first = !seen.has(r.order_number); seen.add(r.order_number); return { ...r, date: day(r.date), order_total: first ? r.order_total : null, paid: first ? r.paid : null, due: first ? r.due : null } }) }
    }
    case 'receivables': {
      const rows = await query<any>(
        `SELECT c.name AS customer, c.credit_limit AS credit_limit,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 0 AND 30 THEN co.balance_due ELSE 0 END) AS b0,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 31 AND 60 THEN co.balance_due ELSE 0 END) AS b31,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 61 AND 90 THEN co.balance_due ELSE 0 END) AS b61,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) > 90 THEN co.balance_due ELSE 0 END) AS b90,
                SUM(co.balance_due) AS total
         FROM customers c JOIN credit_orders co ON co.customer_id = c.id
         WHERE co.balance_due > 0.01 AND co.status NOT IN ('cancelled','rejected','draft') AND c.customer_type = 'Credit' AND c.status = 'active' ${bco}
         GROUP BY c.id HAVING total > 0.01 ORDER BY total DESC`, [p.to, p.to, p.to, p.to])
      return { cols: [T('customer', 'Customer'), M('credit_limit', 'Credit limit ৳'), M('b0', '0–30 d ৳'), M('b31', '31–60 d ৳'), M('b61', '61–90 d ৳'), M('b90', '90 d+ ৳'), M('total', 'Total due ৳')], rows,
        note: `Snapshot as of ${p.to} (end of the selected period); same age buckets as the Ageing Report.` }
    }
    case 'customer_wise': {
      const rows = await query<any>(
        `SELECT c.name AS customer,
                (SELECT COUNT(*) FROM credit_orders co WHERE co.customer_id = c.id AND co.order_date BETWEEN ? AND ? AND co.status NOT IN ('draft','cancelled','rejected')) AS orders,
                (SELECT COALESCE(SUM(co.total_amount),0) FROM credit_orders co WHERE co.customer_id = c.id AND co.order_date BETWEEN ? AND ? AND co.status NOT IN ('draft','cancelled','rejected')) AS sales,
                (SELECT COALESCE(SUM(cp.amount),0) FROM customer_payments cp WHERE cp.customer_id = c.id AND cp.payment_date BETWEEN ? AND ? AND ${live}) AS collected,
                (SELECT COALESCE(SUM(l.debit_amount - l.credit_amount),0) FROM customer_ledger l WHERE l.customer_id = c.id) AS balance
         FROM customers c WHERE c.customer_type = 'Credit' AND c.status = 'active'
         HAVING orders > 0 OR collected > 0 ORDER BY sales DESC`, [p.from, p.to, p.from, p.to, p.from, p.to])
      return { cols: [T('customer', 'Customer'), { key: 'orders', label: 'Orders', fmt: 'qty', sum: true }, M('sales', 'Sales (period) ৳'), M('collected', 'Collected (period) ৳'), M('balance', 'Current balance ৳')], rows,
        note: 'Current balance is the live ledger total (same as the Customer Ledger), including activity outside this period.' }
    }
    case 'collections': {
      const rows = await query<any>(
        `SELECT cp.payment_date AS date, cp.payment_number AS payment_no, c.name AS customer, cp.payment_type AS type, cp.payment_method AS method,
                COALESCE(ba.account_name, 'Cash') AS paid_into, cp.cheque_number, cp.reference_number AS reference, cp.amount,
                (SELECT GROUP_CONCAT(co.order_number SEPARATOR ', ') FROM payment_allocations pa JOIN credit_orders co ON co.id = pa.order_id WHERE pa.payment_id = cp.id) AS orders,
                (SELECT COALESCE(SUM(pa.allocated_amount),0) FROM payment_allocations pa WHERE pa.payment_id = cp.id) AS allocated,
                u.display_name AS recorded_by, cp.notes
         FROM customer_payments cp JOIN customers c ON c.id = cp.customer_id LEFT JOIN users u ON u.id = cp.created_by_user_id LEFT JOIN bank_accounts ba ON ba.id = cp.bank_account_id
         WHERE cp.payment_date BETWEEN ? AND ? AND ${live} ORDER BY cp.payment_date, cp.payment_number`, [p.from, p.to])
      return { cols: [T('date', 'Date'), T('payment_no', 'Receipt'), T('customer', 'Customer'), T('type', 'Type'), T('method', 'Method'), T('paid_into', 'Paid into'), T('cheque_number', 'Cheque #'), T('reference', 'Reference'), M('amount', 'Amount ৳'), T('orders', 'Applied to orders'), M('allocated', 'Applied ৳'), T('recorded_by', 'Recorded by'), T('notes', 'Notes')],
        rows: rows.map(r => ({ ...r, date: day(r.date) })) }
    }
    case 'products_sold': {
      const rows = await query<any>(
        `SELECT p.base_name AS product, COALESCE(pv.grade,'') AS grade, COALESCE(pv.weight_variant,'') AS variant, SUM(coi.quantity) AS qty, SUM(coi.line_total) AS revenue
         FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id JOIN products p ON p.id = coi.product_id LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE co.status = 'delivered' AND co.order_date BETWEEN ? AND ? ${bco} GROUP BY p.id, pv.id ORDER BY revenue DESC`, [p.from, p.to])
      return { cols: [T('product', 'Product'), T('grade', 'Grade'), T('variant', 'Variant'), { key: 'qty', label: 'Quantity', fmt: 'qty', sum: true }, M('revenue', 'Revenue ৳')], rows }
    }
    case 'user_actions': {
      const rows = await query<any>(
        `SELECT COALESCE(u.display_name, 'System') AS user, u.role AS role, sal.module AS module, COUNT(*) AS actions, MAX(sal.created_at) AS last_activity
         FROM system_audit_log sal LEFT JOIN users u ON u.id = sal.user_id WHERE DATE(sal.created_at) BETWEEN ? AND ?
         GROUP BY sal.user_id, sal.module ORDER BY u.display_name, actions DESC`, [p.from, p.to])
      return { cols: [T('user', 'User'), T('role', 'Role'), T('module', 'Module'), { key: 'actions', label: 'Actions', fmt: 'qty', sum: true }, T('last_activity', 'Last activity')], rows: rows.map(r => ({ ...r, last_activity: String(r.last_activity ?? '').slice(0, 16) })) }
    }
    case 'expenses': {
      const rows = await query<any>(
        `SELECT ev.voucher_number AS voucher, ev.expense_date AS date, ec.category_name AS category, b.name AS branch, ev.status, ap.display_name AS approved_by, ev.total_amount AS amount
         FROM expense_vouchers ev LEFT JOIN expense_categories ec ON ec.id = ev.category_id LEFT JOIN branches b ON b.id = ev.branch_id LEFT JOIN users ap ON ap.id = ev.approved_by_user_id
         WHERE ev.expense_date BETWEEN ? AND ? AND ev.status <> 'cancelled' ${bev} ORDER BY ev.expense_date, ev.voucher_number`, [p.from, p.to])
      return { cols: [T('voucher', 'Voucher #'), T('date', 'Date'), T('category', 'Category'), T('branch', 'Branch'), T('status', 'Status'), T('approved_by', 'Approved by'), M('amount', 'Amount ৳')], rows: rows.map(r => ({ ...r, date: day(r.date) })) }
    }
    case 'amendments': {
      const a = await query<any>(
        `SELECT oa.created_at AS at, 'Amendment' AS kind, co.order_number AS order_no, oa.amend_type AS detail, COALESCE(oa.flat_amount,0) AS amount, oa.description AS reason, u.display_name AS by_whom
         FROM order_amendments oa JOIN credit_orders co ON co.id = oa.order_id LEFT JOIN users u ON u.id = oa.requested_by
         WHERE DATE(oa.created_at) BETWEEN ? AND ? AND oa.status = 'approved'`, [p.from, p.to])
      const r = await query<any>(
        `SELECT pr.created_at AS at, 'Price change' AS kind, co.order_number AS order_no, CONCAT(COALESCE(p.base_name,''), ': ', pr.old_unit_price, ' → ', pr.new_unit_price) AS detail,
                (pr.new_unit_price - pr.old_unit_price) * pr.quantity AS amount, pr.reason AS reason, u.display_name AS by_whom
         FROM credit_order_price_revisions pr JOIN credit_orders co ON co.id = pr.order_id LEFT JOIN products p ON p.id = pr.product_id LEFT JOIN users u ON u.id = pr.changed_by_user_id
         WHERE DATE(pr.created_at) BETWEEN ? AND ?`, [p.from, p.to])
      const rows = [...a, ...r].sort((x, y) => String(x.at).localeCompare(String(y.at))).map(x => ({ ...x, at: String(x.at).slice(0, 16) }))
      return { cols: [T('at', 'Date'), T('kind', 'Type'), T('order_no', 'Order #'), T('detail', 'Detail'), M('amount', 'Amount / change ৳'), T('reason', 'Reason'), T('by_whom', 'By')], rows }
    }
    case 'transports': {
      const rows = await query<any>(
        `SELECT co.order_number AS order_no, cos.truck_number AS truck, cos.driver_name AS driver, c.name AS customer, cos.shipped_date AS shipped, cos.delivered_date AS delivered, co.total_amount AS value
         FROM credit_order_shipping cos JOIN credit_orders co ON co.id = cos.order_id JOIN customers c ON c.id = co.customer_id
         WHERE cos.shipped_date IS NOT NULL AND DATE(cos.shipped_date) BETWEEN ? AND ? ${bco} ORDER BY cos.shipped_date`, [p.from, p.to])
      return { cols: [T('order_no', 'Order #'), T('truck', 'Truck'), T('driver', 'Driver'), T('customer', 'Customer'), T('shipped', 'Shipped'), T('delivered', 'Delivered'), M('value', 'Value ৳')],
        rows: rows.map(r => ({ ...r, shipped: String(r.shipped ?? '').slice(0, 16), delivered: String(r.delivered ?? '').slice(0, 16) })) }
    }
    case 'exceptions': {
      const a = await query<any>(
        `SELECT r.reconciled_at AS at, 'Balance reconciliation' AS kind, c.name AS subject, CONCAT('৳', r.old_balance, ' → ৳', r.new_balance) AS what, r.status AS status, u.display_name AS by_whom
         FROM customer_balance_reconciliations r JOIN customers c ON c.id = r.customer_id LEFT JOIN users u ON u.id = r.reconciled_by_user_id WHERE DATE(r.reconciled_at) BETWEEN ? AND ?`, [p.from, p.to])
      const w = await query<any>(
        `SELECT w.performed_at AS at, 'Admin correction' AS kind, co.order_number AS subject, w.comments AS what, w.action AS status, u.display_name AS by_whom
         FROM credit_order_workflow w JOIN credit_orders co ON co.id = w.order_id LEFT JOIN users u ON u.id = w.performed_by_user_id
         WHERE w.action IN ('admin_correction','admin_override') AND DATE(w.performed_at) BETWEEN ? AND ?`, [p.from, p.to])
      const rows = [...a, ...w].sort((x, y) => String(x.at).localeCompare(String(y.at))).map(x => ({ ...x, at: String(x.at).slice(0, 16) }))
      return { cols: [T('at', 'Date'), T('kind', 'Type'), T('subject', 'Subject'), T('what', 'What changed'), T('status', 'Status'), T('by_whom', 'By')], rows }
    }
    case 'daily_reconciliation': {
      const g = async (sql: string) => new Map((await query<any>(sql, [p.from, p.to])).map(r => [String(r.d).slice(0, 10), Number(r.v)]))
      const [created, approved, produced, shipped, delivered, sales, collected, expensed] = await Promise.all([
        g(`SELECT DATE(order_date) d, COUNT(*) v FROM credit_orders WHERE order_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action = 'approved' AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action = 'complete_production' AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action IN ('goods_on_board','ship','shipped') AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE to_status = 'delivered' AND (from_status IS NULL OR from_status <> to_status) AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(order_date) d, SUM(total_amount) v FROM credit_orders WHERE status NOT IN ('draft','cancelled','rejected') AND order_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(payment_date) d, SUM(amount) v FROM customer_payments WHERE reversed_at IS NULL AND payment_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(expense_date) d, SUM(total_amount) v FROM expense_vouchers WHERE status = 'approved' AND expense_date BETWEEN ? AND ? GROUP BY d`)])
      const days = new Set<string>([...created.keys(), ...approved.keys(), ...produced.keys(), ...shipped.keys(), ...delivered.keys(), ...sales.keys(), ...collected.keys(), ...expensed.keys()])
      const rows = [...days].sort().map(d => ({ date: d, created: created.get(d) ?? 0, approved: approved.get(d) ?? 0, produced: produced.get(d) ?? 0, shipped: shipped.get(d) ?? 0, delivered: delivered.get(d) ?? 0, sales: sales.get(d) ?? 0, collected: collected.get(d) ?? 0, expenses: expensed.get(d) ?? 0 }))
      const Q = (k: string, l: string): Col => ({ key: k, label: l, fmt: 'qty', sum: true })
      return { cols: [T('date', 'Date'), Q('created', 'Created'), Q('approved', 'Approved'), Q('produced', 'Produced'), Q('shipped', 'Shipped'), Q('delivered', 'Delivered'), M('sales', 'Sales ৳'), M('collected', 'Collected ৳'), M('expenses', 'Expenses ৳')], rows }
    }
    case 'purchase_orders': {
      const rows = await query<any>(
        `SELECT po.po_number AS po, po.po_date AS date, po.supplier_name AS supplier, pc.name AS commodity, po.wheat_origin AS origin, po.quantity_kg AS qty_kg, po.unit_price_per_kg AS rate,
                po.total_order_value AS value, po.total_received_qty AS received_kg, po.total_paid AS paid, po.delivery_status AS delivery, po.payment_status AS payment, u.display_name AS created_by
         FROM purchase_orders_adnan po LEFT JOIN purchase_commodities pc ON pc.id = po.commodity_id LEFT JOIN users u ON u.id = po.created_by_user_id
         WHERE po.po_date BETWEEN ? AND ? ORDER BY po.po_date, po.po_number`, [p.from, p.to])
      return { cols: [T('po', 'PO #'), T('date', 'Date'), T('supplier', 'Supplier'), T('commodity', 'Commodity'), T('origin', 'Origin'), { key: 'qty_kg', label: 'Ordered kg', fmt: 'qty', sum: true }, M('rate', 'Rate ৳/kg', false), M('value', 'Value ৳'), { key: 'received_kg', label: 'Received kg', fmt: 'qty', sum: true }, M('paid', 'Paid ৳'), T('delivery', 'Delivery'), T('payment', 'Payment'), T('created_by', 'Created by')], rows: rows.map(r => ({ ...r, date: day(r.date) })) }
    }
    case 'goods_received': {
      const rows = await query<any>(
        `SELECT g.grn_number AS grn, g.grn_date AS date, g.po_number AS po, g.supplier_name AS supplier, g.truck_number AS truck, g.quantity_received_kg AS received_kg, g.expected_quantity AS expected_kg,
                g.weight_variance AS variance_kg, g.variance_percentage AS variance_pct, g.unit_price_per_kg AS rate, g.total_value AS value, g.grn_status AS status, u.display_name AS received_by
         FROM goods_received_adnan g LEFT JOIN users u ON u.id = g.receiver_user_id WHERE g.grn_date BETWEEN ? AND ? ORDER BY g.grn_date, g.grn_number`, [p.from, p.to])
      return { cols: [T('grn', 'GRN #'), T('date', 'Date'), T('po', 'PO #'), T('supplier', 'Supplier'), T('truck', 'Truck'), { key: 'received_kg', label: 'Received kg', fmt: 'qty', sum: true }, { key: 'expected_kg', label: 'Expected kg', fmt: 'qty', sum: true }, { key: 'variance_kg', label: 'Variance kg', fmt: 'qty', sum: true }, { key: 'variance_pct', label: 'Variance %', fmt: 'qty' }, M('rate', 'Rate ৳/kg', false), M('value', 'Value ৳'), T('status', 'Status'), T('received_by', 'Received by')], rows: rows.map(r => ({ ...r, date: day(r.date) })) }
    }
    case 'supplier_payments': {
      const rows = await query<any>(
        `SELECT pp.payment_voucher_number AS voucher, pp.payment_date AS date, pp.po_number AS po, pp.supplier_name AS supplier, pp.amount_paid AS amount, pp.payment_method AS method, pp.bank_name AS paid_from,
                pp.reference_number AS reference, pp.payment_type AS type, IF(pp.is_posted = 1, 'Yes', 'Deleted') AS posted, pp.handled_by_employee AS handled_by, u.display_name AS recorded_by, pp.remarks
         FROM purchase_payments_adnan pp LEFT JOIN users u ON u.id = pp.created_by_user_id WHERE pp.payment_date BETWEEN ? AND ? ORDER BY pp.payment_date, pp.payment_voucher_number`, [p.from, p.to])
      return { cols: [T('voucher', 'Voucher #'), T('date', 'Date'), T('po', 'PO #'), T('supplier', 'Supplier'), M('amount', 'Amount ৳'), T('method', 'Method'), T('paid_from', 'Paid from'), T('reference', 'Reference'), T('type', 'Type'), T('posted', 'Posted'), T('handled_by', 'Handled by'), T('recorded_by', 'Recorded by'), T('remarks', 'Remarks')], rows: rows.map(r => ({ ...r, date: day(r.date) })) }
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown report type' })
}
