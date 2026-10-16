import { query, queryOne } from '~/server/utils/db'
import { AMD_PRE_STATUSES } from '~/server/utils/amendments'

/**
 * "What did a price change do to this order?" — one read-only view tying together
 * the line prices (original → current), the price history, the amendments, and what
 * was actually posted to the customer's ledger as the invoice.
 * (Legacy: credit_order_view.php price-revision table + order_amendment.php + invoice print.)
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const order = await queryOne<any>(
    `SELECT id, order_number, status, subtotal, total_amount, balance_due, advance_paid, amount_paid, discount_amount, tax_amount
     FROM credit_orders WHERE id = ?`, [id])
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  const items = await query<any>(
    `SELECT oi.id, oi.quantity, oi.unit_price, oi.discount_amount, oi.line_total, p.base_name AS product_name, pv.weight_variant, pv.grade
     FROM credit_order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id = ? ORDER BY oi.id`, [id])

  let revisions: any[] = []
  try {
    revisions = await query<any>(
      `SELECT r.id, r.order_item_id, r.quantity, r.old_unit_price, r.new_unit_price, r.reason, r.created_at,
              u.display_name AS changed_by, p.base_name AS product_name, pv.weight_variant
       FROM credit_order_price_revisions r
       LEFT JOIN users u ON u.id = r.changed_by_user_id
       LEFT JOIN products p ON p.id = r.product_id
       LEFT JOIN product_variants pv ON pv.id = r.variant_id
       WHERE r.order_id = ? ORDER BY r.id ASC`, [id])
  } catch { /* table not created yet */ }

  // Original price = the "old" price of the earliest revision on the line (else it never changed).
  const lines = items.map((it) => {
    const first = revisions.find(r => Number(r.order_item_id) === Number(it.id))
    const original = first ? Number(first.old_unit_price) : Number(it.unit_price)
    return {
      id: it.id, product_name: it.product_name, weight_variant: it.weight_variant, grade: it.grade,
      quantity: Number(it.quantity), original_price: original, current_price: Number(it.unit_price),
      impact: Math.round((Number(it.unit_price) - original) * Number(it.quantity) * 100) / 100,
    }
  })

  const amendments = (await query<any>(
    `SELECT a.id, a.amendment_number, a.regime, a.amend_type, a.status, a.description, a.flat_amount,
            a.new_values, a.old_values, a.created_at, a.customer_consent_note, ru.display_name AS requested_by
     FROM order_amendments a LEFT JOIN users ru ON ru.id = a.requested_by
     WHERE a.order_id = ? ORDER BY a.id ASC`, [id])).map((a: any) => {
    let oldV: any = {}, newV: any = {}
    try { oldV = JSON.parse(a.old_values ?? '{}') } catch { /* */ }
    try { newV = JSON.parse(a.new_values ?? '{}') } catch { /* */ }
    const changes = (newV.items ?? []).map((n: any) => {
      const o = (oldV.items ?? []).find((x: any) => Number(x.id) === Number(n.item_id))
      return o ? { item_id: n.item_id, old_qty: Number(o.quantity), new_qty: Number(n.quantity), old_price: Number(o.unit_price), new_price: Number(n.unit_price) } : null
    }).filter((c: any) => c && (c.old_qty !== c.new_qty || c.old_price !== c.new_price))
    return { id: a.id, amendment_number: a.amendment_number, regime: a.regime, amend_type: a.amend_type, status: a.status,
      description: a.description, delta: a.flat_amount != null ? Number(a.flat_amount) : (newV.total_amount != null && oldV.total_amount != null ? Number(newV.total_amount) - Number(oldV.total_amount) : null),
      consent: a.customer_consent_note, requested_by: a.requested_by, created_at: a.created_at, changes }
  })

  // What the customer's ledger actually carries for this order.
  const inv = await queryOne<any>(
    `SELECT COALESCE(SUM(debit_amount),0) debit, MIN(transaction_date) d FROM customer_ledger
     WHERE reference_type IN ('credit_order','credit_orders') AND reference_id = ? AND transaction_type = 'invoice'`, [id])
  const notes = await queryOne<any>(
    `SELECT COALESCE(SUM(cl.debit_amount - cl.credit_amount),0) net FROM customer_ledger cl
     JOIN order_amendments a ON a.id = cl.reference_id
     WHERE cl.reference_type = 'order_amendment' AND a.order_id = ?`, [id])
  const invoiced = Number(inv?.debit ?? 0) > 0
  const invoiceNet = Math.round((Number(inv?.debit ?? 0) + Number(notes?.net ?? 0)) * 100) / 100
  const gap = invoiced ? Math.round((Number(order.total_amount) - invoiceNet) * 100) / 100 : 0

  let autoApply = false
  try {
    const row = await queryOne<any>(`SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`)
    autoApply = !!JSON.parse(row?.setting_value ?? '{}').auto_apply_to_orders
  } catch { /* */ }

  return {
    order_total: Number(order.total_amount), balance_due: Number(order.balance_due),
    stage: invoiced ? 'invoiced' : AMD_PRE_STATUSES.includes(order.status) ? 'open' : 'closed',
    lines, revisions, amendments,
    total_impact: Math.round(lines.reduce((s, l) => s + l.impact, 0) * 100) / 100,
    invoice: { posted: invoiced, amount: Number(inv?.debit ?? 0), date: inv?.d ?? null, notes_net: Number(notes?.net ?? 0), net: invoiceNet, gap },
    auto_apply: autoApply,
  }
})
