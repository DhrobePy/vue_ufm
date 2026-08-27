import type { PoolConnection } from 'mysql2/promise'
import { postJournalEntry, getGLAccountId } from '~/server/utils/creditOrders'

/**
 * GRN → General Ledger. Wheat received on a GRN is raw-material inventory
 * regardless of what it's later used for — some goes to production (flour
 * and other products), some gets resold as-is through the Trading module.
 * Both downstream paths already draw down the SAME account: Trading's own
 * COGS postings (postCommoditySaleCost / postOtherSalesCOGS in
 * commodityTrading.ts) credit `purchase_commodities.inventory_account_id`
 * when stock is sold or consumed. That account was reserved for exactly
 * this GRN-side posting (see the db-migrate comment on the column) but
 * never actually wired up — meaning it could only ever be credited, never
 * debited, until now.
 *
 * DR the commodity's inventory account · CR Accounts Payable, valued at the
 * GRN's billed total_value (same figure already used for balance_payable).
 * A PO with no commodity_id, or a commodity with no inventory account
 * configured, skips silently (warned) — never blocks the GRN itself, same
 * discipline as postCommodityGRNCost's own best-effort call.
 */
export async function postGRNJournalEntry(conn: PoolConnection, opts: {
  grnId: number, poId: number, grnNumber: string, poNumber: string,
  grnDate: string, totalValue: number, userId: number,
}): Promise<number | null> {
  const [[po]] = await (conn as any).query(
    `SELECT commodity_id FROM purchase_orders_adnan WHERE id = ?`, [opts.poId],
  )
  if (!po?.commodity_id) {
    console.warn(`[grn-gl] Skipping JE for ${opts.grnNumber}: PO has no commodity_id`)
    return null
  }
  const [[commodity]] = await (conn as any).query(
    `SELECT inventory_account_id, name FROM purchase_commodities WHERE id = ?`, [po.commodity_id],
  )
  if (!commodity?.inventory_account_id) {
    console.warn(`[grn-gl] Skipping JE for ${opts.grnNumber}: commodity has no inventory_account_id configured`)
    return null
  }
  const apId = await getGLAccountId(conn, 'Accounts Payable')
  if (!apId) {
    console.warn(`[grn-gl] Skipping JE for ${opts.grnNumber}: no Accounts Payable account in chart_of_accounts`)
    return null
  }

  const jeId = await postJournalEntry(conn, {
    date: opts.grnDate,
    description: `GRN ${opts.grnNumber} — PO ${opts.poNumber} · ${commodity.name} · ৳${opts.totalValue.toLocaleString()}`,
    docType: 'grn_adnan', docId: opts.grnId, userId: opts.userId,
    lines: [
      { accountId: Number(commodity.inventory_account_id), debit: opts.totalValue, credit: 0, memo: opts.grnNumber },
      { accountId: apId, debit: 0, credit: opts.totalValue, memo: opts.grnNumber },
    ],
  })
  await (conn as any).query(`UPDATE goods_received_adnan SET journal_entry_id = ? WHERE id = ?`, [jeId, opts.grnId])
  return jeId
}

/**
 * Reverses a GRN's journal entry with a mirror-image entry (swap debit/
 * credit on the same accounts) — the original posting is never mutated or
 * deleted, matching the reversing-entry discipline used everywhere else in
 * this app (credit-sales payment reversal, commodity-sale edits, purchase
 * payment reversal).
 */
export async function reverseGRNJournalEntry(conn: PoolConnection, opts: {
  journalEntryId: number, grnNumber: string, reason: string, userId: number, grnId: number,
}): Promise<number | null> {
  const [origLines] = await (conn as any).query(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [opts.journalEntryId],
  )
  if (!origLines.length) return null

  const [jeRes] = await (conn as any).query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (CURDATE(), ?, 'grn_adnan_reversal', ?, ?)`,
    [`Reversal of ${opts.grnNumber}${opts.reason ? ` (${opts.reason})` : ''}`.slice(0, 255), opts.grnId, opts.userId],
  )
  const reversalJeId = jeRes.insertId
  for (const l of origLines) {
    await (conn as any).query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [reversalJeId, l.account_id, Number(l.credit_amount), Number(l.debit_amount), `REV-${opts.grnNumber}`],
    )
  }
  return reversalJeId
}
