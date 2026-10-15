/**
 * Pricing → open orders (legacy applyPricingEngineChangeToOpenOrders).
 * When a catalog price changes and the "auto-apply to open orders" switch is ON
 * (Pricing Engine panel; default OFF), every not-yet-invoiced order line for that
 * variant + branch moves by the same ৳ delta, with a per-line revision row.
 *
 * "Not yet invoiced" is decided by the FACT that can't bounce back — a posted invoice
 * (journal entry or ledger row) — in addition to status, because status can be moved
 * back to ready_to_ship by a reversal/override and a stale posted invoice would result.
 * Call inside the caller's transaction, after the price rows are written.
 */
export async function priceAutoApplyEnabled(conn: any): Promise<boolean> {
  try {
    const [[row]] = await conn.query(`SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`)
    return !!JSON.parse(row?.setting_value ?? '{}').auto_apply_to_orders
  } catch { return false }
}

export async function applyPriceChangeToOpenOrders(conn: any, opts: {
  variantId: number; branchId: number; oldPrice: number | null; newPrice: number | null
  userId: number; label: string
}): Promise<{ orders: number; items: number }> {
  const out = { orders: 0, items: 0 }
  if (opts.oldPrice == null || opts.newPrice == null) return out
  const delta = Math.round((opts.newPrice - opts.oldPrice) * 100) / 100
  if (Math.abs(delta) < 0.005) return out

  const [items] = await conn.query(
    `SELECT coi.id AS item_id, coi.order_id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, coi.discount_amount
     FROM credit_order_items coi
     JOIN credit_orders co ON co.id = coi.order_id
     WHERE coi.variant_id = ? AND co.assigned_branch_id = ?
       AND co.status NOT IN ('goods_on_board','shipped','dispatched','delivered','completed','cancelled','rejected')
       AND NOT EXISTS (SELECT 1 FROM journal_entries je
                       WHERE je.related_document_type IN ('credit_orders','CreditOrder') AND je.related_document_id = co.id)
       AND NOT EXISTS (SELECT 1 FROM customer_ledger cl
                       WHERE cl.reference_type IN ('credit_order','credit_orders') AND cl.reference_id = co.id AND cl.transaction_type = 'invoice')`,
    [opts.variantId, opts.branchId],
  )
  if (!items.length) return out

  const reason = `Auto-applied: Pricing Engine changed the catalog price from ৳${opts.oldPrice.toFixed(2)} to ৳${opts.newPrice.toFixed(2)} (change made by ${opts.label}).`
  const touched = new Set<number>()
  for (const it of items) {
    const oldUnit = Number(it.unit_price)
    const newUnit = Math.max(0, Math.round((oldUnit + delta) * 100) / 100)
    const newLine = Math.round((Number(it.quantity) * newUnit - Number(it.discount_amount ?? 0)) * 100) / 100
    await conn.query(`UPDATE credit_order_items SET unit_price = ?, line_total = ? WHERE id = ?`, [newUnit, newLine, it.item_id])
    await conn.query(
      `INSERT INTO credit_order_price_revisions
         (order_id, order_item_id, product_id, variant_id, quantity, old_unit_price, new_unit_price, reason, changed_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [it.order_id, it.item_id, it.product_id, it.variant_id, it.quantity, oldUnit, newUnit, reason, opts.userId],
    )
    touched.add(it.order_id)
    out.items++
  }
  for (const orderId of touched) {
    const [[agg]] = await conn.query(`SELECT COALESCE(SUM(line_total),0) s FROM credit_order_items WHERE order_id = ?`, [orderId])
    const [[o]] = await conn.query(`SELECT subtotal, total_amount, advance_paid, amount_paid FROM credit_orders WHERE id = ?`, [orderId])
    const newSub = Math.round(Number(agg.s) * 100) / 100
    // Keep every non-item component (surcharge, discount, tax) exactly as it was — only the item delta moves the total.
    const newTotal = Math.round((Number(o.total_amount) + (newSub - Number(o.subtotal))) * 100) / 100
    const newBal = Math.max(0, Math.round((newTotal - Number(o.advance_paid) - Number(o.amount_paid)) * 100) / 100)
    await conn.query(`UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW() WHERE id = ?`, [newSub, newTotal, newBal, orderId])
    out.orders++
  }
  return out
}
