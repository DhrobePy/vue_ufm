/**
 * Commodity Trading — weighted-average costing engine + GL account seeds.
 *
 * Inventory is split per commodity × branch × origin ('' = origin not
 * tracked). GRNs raise stock at a new weighted-average cost; sales consume
 * at the current average (COGS) and may go NEGATIVE when the seller used an
 * explicit stock override — flagged on the inventory view, never blocked.
 *
 * Trading GL is deliberately separate from flour's:
 *   4900 Commodity Trading Revenue   (Revenue)
 *   5900 Commodity Cost of Goods Sold (Cost of Goods Sold)
 * so trading margin is separately reportable. The inventory-asset account
 * comes from purchase_commodities.inventory_account_id (set per commodity
 * in the procurement catalog) — a commodity can't be sold until that's set.
 */

/** Get-or-create one of the trading GL accounts. Returns chart_of_accounts.id. */
async function getOrCreateGLAccount(
  conn: any, accountNumber: string, name: string, accountType: string, group: string, normal: string,
): Promise<number> {
  const [[existing]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_number = ? LIMIT 1`, [accountNumber],
  )
  if (existing) return Number(existing.id)
  const [res] = await conn.query(
    `INSERT INTO chart_of_accounts
       (account_number, account_type, account_type_group, normal_balance, status, is_active, description, name)
     VALUES (?, ?, ?, ?, 'active', 1, ?, ?)`,
    [accountNumber, accountType, group, normal, `Auto-created for the Commodity Trading module`, name],
  )
  return Number(res.insertId)
}

export async function getTradingRevenueAccountId(conn: any): Promise<number> {
  return getOrCreateGLAccount(conn, '4900', 'Commodity Trading Revenue', 'Revenue', 'Revenue', 'Credit')
}

export async function getTradingCOGSAccountId(conn: any): Promise<number> {
  return getOrCreateGLAccount(conn, '5900', 'Commodity Cost of Goods Sold', 'Cost of Goods Sold', 'Expense', 'Debit')
}

export async function getLoansReceivableAccountId(conn: any): Promise<number> {
  return getOrCreateGLAccount(conn, '1450', 'Loans & Advances Receivable', 'Other Current Asset', 'Asset', 'Debit')
}

/** Current stock row (or zeros) for one commodity×branch×origin pool. */
export async function getCommodityInventory(
  conn: any, commodityId: number, branchId: number, origin = '',
): Promise<{ qty: number; avgCost: number }> {
  const [[row]] = await conn.query(
    `SELECT qty_on_hand, weighted_avg_cost FROM commodity_inventory
     WHERE commodity_id = ? AND branch_id = ? AND origin = ?`,
    [commodityId, branchId, origin],
  )
  return { qty: Number(row?.qty_on_hand ?? 0), avgCost: Number(row?.weighted_avg_cost ?? 0) }
}

/**
 * GRN receipt → raise stock, blend the weighted-average cost.
 * newAvg = (oldQty×oldAvg + inQty×inCost) / (oldQty + inQty), guarding the
 * degenerate cases (empty or negative pool adopts the incoming cost).
 */
export async function postCommodityGRNCost(conn: any, opts: {
  commodityId: number; branchId: number; origin?: string; qty: number; unitCost: number
}): Promise<void> {
  const origin = opts.origin ?? ''
  const { qty: oldQty, avgCost: oldAvg } = await getCommodityInventory(conn, opts.commodityId, opts.branchId, origin)
  const newQty = oldQty + opts.qty
  const newAvg = oldQty > 0 && newQty > 0
    ? (oldQty * oldAvg + opts.qty * opts.unitCost) / newQty
    : opts.unitCost
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand), weighted_avg_cost = VALUES(weighted_avg_cost)`,
    [opts.commodityId, opts.branchId, origin, newQty, newAvg],
  )
}

/**
 * Sale → decrement stock at the current average cost; returns the COGS.
 * Stock is allowed to go negative (explicit user override at sale time) —
 * flagged red on the inventory view rather than blocked.
 */
export async function postCommoditySaleCost(conn: any, opts: {
  commodityId: number; branchId: number; origin?: string; qty: number
}): Promise<{ cogs: number; avgCost: number }> {
  const origin = opts.origin ?? ''
  const { qty: oldQty, avgCost } = await getCommodityInventory(conn, opts.commodityId, opts.branchId, origin)
  const cogs = Math.round(opts.qty * avgCost * 100) / 100
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand)`,
    [opts.commodityId, opts.branchId, origin, oldQty - opts.qty, avgCost],
  )
  return { cogs, avgCost }
}

/** Reversal helper — put a sale's quantity back into its exact origin pool. */
export async function restoreCommodityStock(conn: any, opts: {
  commodityId: number; branchId: number; origin?: string; qty: number
}): Promise<void> {
  const origin = opts.origin ?? ''
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE qty_on_hand = qty_on_hand + VALUES(qty_on_hand)`,
    [opts.commodityId, opts.branchId, origin, opts.qty],
  )
}

/**
 * Other Sales: post the COGS + stock decrement for a commodity-tagged
 * credit order the moment its goods-on-board invoice posts. Idempotent —
 * keyed on a JE of docType 'OtherSalesCOGS' per order, so both the
 * workflow endpoint and the public QR gate-scan can call it safely.
 * Returns total COGS posted (0 = nothing to do / already posted).
 */
export async function postOtherSalesCOGS(conn: any, opts: {
  orderId: number; orderNumber: string; branchId: number | null; userId: number
}): Promise<number> {
  const [[already]] = await conn.query(
    `SELECT id FROM journal_entries
     WHERE related_document_type = 'OtherSalesCOGS' AND related_document_id = ? LIMIT 1`,
    [opts.orderId],
  )
  if (already) return 0

  const [items] = await conn.query(
    `SELECT commodity_id, commodity_origin, quantity FROM credit_order_items
     WHERE order_id = ? AND commodity_id IS NOT NULL`, [opts.orderId],
  )
  if (!items.length) return 0

  const branchId = Number(opts.branchId ?? 0)
  const cogsId = await getTradingCOGSAccountId(conn)
  const lines: { accountId: number; debit: number; credit: number; memo?: string }[] = []
  let totalCogs = 0

  for (const it of items) {
    const { cogs } = await postCommoditySaleCost(conn, {
      commodityId: Number(it.commodity_id), branchId,
      origin: it.commodity_origin ?? '', qty: Number(it.quantity),
    })
    if (cogs <= 0) continue
    const [[commodity]] = await conn.query(
      `SELECT inventory_account_id FROM purchase_commodities WHERE id = ?`, [it.commodity_id],
    )
    if (!commodity?.inventory_account_id) continue // no GL account mapped — stock moved, GL skipped (warned at sale time)
    totalCogs += cogs
    lines.push({ accountId: Number(commodity.inventory_account_id), debit: 0, credit: cogs, memo: `${opts.orderNumber} inventory` })
  }

  if (totalCogs > 0) {
    lines.unshift({ accountId: cogsId, debit: totalCogs, credit: 0, memo: `${opts.orderNumber} COGS` })
    await postJournalEntry(conn, {
      date: new Date().toISOString().slice(0, 10),
      description: `Other Sales COGS — ${opts.orderNumber}`,
      docType: 'OtherSalesCOGS', docId: opts.orderId, userId: opts.userId, lines,
    })
  }
  return totalCogs
}

// ─── Sale posting (the ONE place a commodity sale hits money + stock) ─────────
import { getGLAccountId, postJournalEntry, postCustomerLedger, nextDocNumber } from '~/server/utils/creditOrders'

export interface CommoditySaleInput {
  customerId: number
  commodityId: number
  branchId: number | null
  origin?: string
  saleDate: string
  quantity: number
  unitPrice: number
  stockOverride?: boolean
  sourcePurchaseOrderId?: number | null
  notes?: string | null
  userId: number
}

/**
 * Post one commodity sale: decrement stock (COGS at weighted-avg), ONE
 * compound JE (DR AR / CR Trading Revenue / DR COGS / CR commodity inventory
 * account), one customer_ledger invoice row, one commodity_sales row.
 * Caller owns the transaction. Throws on any validation failure.
 */
export async function postCommoditySale(conn: any, s: CommoditySaleInput): Promise<{
  saleId: number; saleNumber: string; totalAmount: number; cogs: number
}> {
  const [[commodity]] = await conn.query(
    `SELECT id, name, unit, is_sellable, inventory_account_id FROM purchase_commodities WHERE id = ?`,
    [s.commodityId],
  )
  if (!commodity) throw createError({ statusCode: 404, statusMessage: 'Commodity not found' })
  if (!commodity.is_sellable) throw createError({ statusCode: 400, statusMessage: `${commodity.name} is not marked sellable — enable it in the Procurement Catalog first` })
  if (!commodity.inventory_account_id)
    throw createError({ statusCode: 400, statusMessage: `${commodity.name} has no inventory GL account — set it in the Procurement Catalog before selling` })

  const qty = Number(s.quantity)
  const price = Number(s.unitPrice)
  if (qty <= 0 || price <= 0) throw createError({ statusCode: 400, statusMessage: 'Quantity and unit price must be positive' })
  const totalAmount = Math.round(qty * price * 100) / 100
  const origin = s.origin ?? ''
  const branchId = Number(s.branchId ?? 0)

  // Stock check — warn-level enforcement: the client shows the warning and
  // sends stock_override=true when the user explicitly accepts going negative.
  const { qty: onHand } = await getCommodityInventory(conn, s.commodityId, branchId, origin)
  if (qty > onHand && !s.stockOverride)
    throw createError({
      statusCode: 409,
      statusMessage: `Only ${onHand.toLocaleString()} ${commodity.unit} on hand${origin ? ` (${origin})` : ''} — confirm the override to sell past stock`,
    })

  const { cogs } = await postCommoditySaleCost(conn, { commodityId: s.commodityId, branchId, origin, qty })

  const saleNumber = await nextDocNumber(conn, 'CTS', 'commodity_sales')

  // ONE compound JE: DR AR / CR Trading Revenue / DR COGS / CR Inventory
  const arId  = await getGLAccountId(conn, 'Accounts Receivable')
  const revId = await getTradingRevenueAccountId(conn)
  const cogsId = await getTradingCOGSAccountId(conn)
  let jeId: number | null = null
  if (arId) {
    const lines = [
      { accountId: arId,  debit: totalAmount, credit: 0, memo: saleNumber },
      { accountId: revId, debit: 0, credit: totalAmount, memo: saleNumber },
    ]
    if (cogs > 0) {
      lines.push({ accountId: cogsId, debit: cogs, credit: 0, memo: `${saleNumber} COGS` })
      lines.push({ accountId: Number(commodity.inventory_account_id), debit: 0, credit: cogs, memo: `${saleNumber} inventory` })
    }
    jeId = await postJournalEntry(conn, {
      date: s.saleDate,
      description: `Commodity sale — ${saleNumber} (${commodity.name}${origin ? `, ${origin}` : ''})`,
      docType: 'CommoditySale', docId: 0, userId: s.userId, lines,
    })
  } else {
    console.warn(`[trading] Missing AR account — sale ${saleNumber} posted without JE`)
  }

  const [saleRes] = await conn.query(
    `INSERT INTO commodity_sales
       (sale_number, customer_id, commodity_id, branch_id, origin, source_purchase_order_id,
        sale_date, quantity, unit, unit_price, total_amount, balance_due, cogs_amount,
        stock_override, status, journal_entry_id, notes, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted', ?, ?, ?)`,
    [
      saleNumber, s.customerId, s.commodityId, s.branchId ?? null, origin,
      s.sourcePurchaseOrderId ?? null, s.saleDate, qty, commodity.unit, price,
      totalAmount, totalAmount, cogs, s.stockOverride ? 1 : 0, jeId, s.notes ?? null, s.userId,
    ],
  )
  const saleId = Number(saleRes.insertId)

  if (jeId) {
    await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [saleId, jeId])
  }

  // Customer ledger invoice row — a commodity sale behaves like any other
  // invoice in the customer's statement/true balance.
  const ledgerId = await postCustomerLedger(conn, {
    customerId: s.customerId, date: s.saleDate, transactionType: 'invoice',
    referenceType: 'commodity_sale', referenceId: saleId, invoiceNumber: saleNumber,
    description: `Commodity sale — ${saleNumber} (${commodity.name}${origin ? `, ${origin}` : ''}) ${qty.toLocaleString()} ${commodity.unit} @ ৳${price.toLocaleString()}`,
    debit: totalAmount, credit: 0, journalEntryId: jeId, userId: s.userId,
  })
  await conn.query(`UPDATE commodity_sales SET customer_ledger_id = ? WHERE id = ?`, [ledgerId, saleId])

  return { saleId, saleNumber, totalAmount, cogs }
}
