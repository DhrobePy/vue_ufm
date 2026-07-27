import { query } from '~/server/utils/db'

/**
 * GET /api/search?q=... — real dynamic search across every major entity.
 * Backs the global command-palette (⌘K / topbar search icon), which
 * previously filtered a hardcoded array of fake sample data — this is the
 * actual implementation the old code's own comment said belonged here.
 * Each sub-query is defensive (missing table/column never kills the whole
 * search) and capped small since results merge into one dropdown list.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = String(getQuery(event).q ?? '').trim()
  if (q.length < 2) return { results: [] }
  const like = `%${q}%`
  const results: any[] = []

  const safe = async (fn: () => Promise<any[]>) => {
    try { return await fn() } catch { return [] }
  }

  const [
    customers, orders, products, suppliers, pos, expenses,
    employees, branches, tradingSales, loans, users,
  ] = await Promise.all([
    safe(() => query<any>(
      `SELECT id, name, business_name, phone_number, current_balance FROM customers
       WHERE name LIKE ? OR business_name LIKE ? OR phone_number LIKE ?
       ORDER BY name LIMIT 6`, [like, like, like])),
    safe(() => query<any>(
      `SELECT o.id, o.order_number, o.status, o.total_amount, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number LIKE ? OR c.name LIKE ?
       ORDER BY o.id DESC LIMIT 6`, [like, like])),
    safe(() => query<any>(
      `SELECT p.id AS product_id, p.base_name, v.id AS variant_id, v.weight_variant, v.sku
       FROM products p JOIN product_variants v ON v.product_id = p.id
       WHERE p.base_name LIKE ? OR v.sku LIKE ?
       ORDER BY p.base_name LIMIT 6`, [like, like])),
    safe(() => query<any>(
      `SELECT id, company_name, phone, current_balance FROM suppliers
       WHERE company_name LIKE ? OR phone LIKE ?
       ORDER BY company_name LIMIT 6`, [like, like])),
    safe(() => query<any>(
      `SELECT id, po_number, supplier_name, po_status FROM purchase_orders_adnan
       WHERE po_number LIKE ? OR supplier_name LIKE ?
       ORDER BY id DESC LIMIT 6`, [like, like])),
    safe(() => query<any>(
      `SELECT id, voucher_number, total_amount, status FROM expense_vouchers
       WHERE voucher_number LIKE ? OR remarks LIKE ? OR handled_by_person LIKE ?
       ORDER BY id DESC LIMIT 6`, [like, like, like])),
    safe(() => query<any>(
      `SELECT id, first_name, last_name, designation FROM employees
       WHERE first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name,' ',last_name) LIKE ?
       ORDER BY first_name LIMIT 5`, [like, like, like])),
    safe(() => query<any>(
      `SELECT id, name, code FROM branches WHERE name LIKE ? OR code LIKE ? ORDER BY name LIMIT 5`,
      [like, like])),
    safe(() => query<any>(
      `SELECT s.id, s.sale_number, s.total_amount, c.name AS customer_name
       FROM commodity_sales s JOIN customers c ON c.id = s.customer_id
       WHERE s.sale_number LIKE ? OR c.name LIKE ?
       ORDER BY s.id DESC LIMIT 5`, [like, like])),
    safe(() => query<any>(
      `SELECT l.id, l.loan_number, l.principal_amount, COALESCE(c.name, s.company_name) AS borrower_name
       FROM loans l LEFT JOIN customers c ON c.id = l.customer_id LEFT JOIN suppliers s ON s.id = l.supplier_id
       WHERE l.loan_number LIKE ? OR c.name LIKE ? OR s.company_name LIKE ?
       ORDER BY l.id DESC LIMIT 5`, [like, like, like])),
    safe(() => query<any>(
      `SELECT id, display_name, email, role FROM users
       WHERE display_name LIKE ? OR email LIKE ?
       ORDER BY display_name LIMIT 5`, [like, like])),
  ])

  for (const c of customers) results.push({
    type: 'customer', icon: '👤', label: c.name,
    sublabel: `${c.business_name ? c.business_name + ' · ' : ''}৳${Number(c.current_balance ?? 0).toLocaleString()} due`,
    route: `/customers/${c.id}`,
  })
  for (const o of orders) results.push({
    type: 'order', icon: '📋', label: o.order_number,
    sublabel: `${o.customer_name} · ৳${Number(o.total_amount).toLocaleString()} · ${String(o.status).replace(/_/g, ' ')}`,
    route: `/credit-sales/${o.id}`,
  })
  for (const p of products) results.push({
    type: 'product', icon: '🌾', label: `${p.base_name} (${p.weight_variant})`,
    sublabel: p.sku ?? '', route: `/products/${p.product_id}/variants`,
  })
  for (const s of suppliers) results.push({
    type: 'supplier', icon: '🏭', label: s.company_name,
    sublabel: `${s.phone ?? ''} · ৳${Number(s.current_balance ?? 0).toLocaleString()} payable`,
    route: `/purchase/suppliers/${s.id}`,
  })
  for (const p of pos) results.push({
    type: 'po', icon: '🛒', label: p.po_number,
    sublabel: `${p.supplier_name} · ${p.po_status}`, route: `/purchase/orders/${p.id}`,
  })
  for (const e of expenses) results.push({
    type: 'expense', icon: '💸', label: e.voucher_number,
    sublabel: `৳${Number(e.total_amount).toLocaleString()} · ${e.status}`, route: `/expenses/${e.id}`,
  })
  for (const e of employees) results.push({
    type: 'employee', icon: '🧑‍💼', label: `${e.first_name} ${e.last_name ?? ''}`.trim(),
    sublabel: e.designation ?? '', route: `/hr/employees/${e.id}`,
  })
  for (const b of branches) results.push({
    type: 'branch', icon: '📍', label: b.name, sublabel: b.code ?? '', route: `/admin/settings`,
  })
  for (const s of tradingSales) results.push({
    type: 'trading', icon: '📦', label: s.sale_number,
    sublabel: `${s.customer_name} · ৳${Number(s.total_amount).toLocaleString()}`, route: `/trading/sales/${s.id}`,
  })
  for (const l of loans) results.push({
    type: 'loan', icon: '🤝', label: l.loan_number,
    sublabel: `${l.borrower_name ?? '—'} · ৳${Number(l.principal_amount).toLocaleString()}`, route: `/loans/${l.id}`,
  })
  for (const u of users) results.push({
    type: 'user', icon: '👥', label: u.display_name,
    sublabel: `${u.email} · ${u.role}`, route: `/admin/users/${u.id}/permissions`,
  })

  return { results }
})
