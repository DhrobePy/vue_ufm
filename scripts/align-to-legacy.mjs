#!/usr/bin/env node
/**
 * CUTOVER STEP: make the Vue app's credit-sales data equal the legacy app's, by moving everything that exists ONLY in Vue
 * (pilot/test-period orders, payments, ledger lines, their journal entries) into the Recycle Bin — one restorable batch.
 *
 *   • Dry run by default: prints what would move and the customer balances it would leave (vs legacy).
 *   • --apply writes it, in ONE transaction, then re-derives customers.current_balance from the ledger.
 *   • Nothing is hard-deleted: every row is snapshotted into recycle_bin_items first (Admin → Recycle Bin can restore the batch).
 *
 * What counts as "only in Vue":
 *   orders    — order_number not in legacy
 *   payments  — payment_number not in legacy
 *   ledger    — id not in legacy, or same id but a different row (customer / amounts / date)
 * and everything hanging off them: order children (items, shipping, workflow, deliveries, returns, amendments, holds, price
 * revisions, allocations …), journal entries + lines, bridged bank rows.
 *
 *   ssh -L 3307:localhost:3306 …   then   node scripts/align-to-legacy.mjs [--apply]
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const conn = (p) => mysql.createConnection({ host: env[`${p}_DB_HOST`] ?? '127.0.0.1', port: Number(env[`${p}_DB_PORT`] ?? 3307), user: env[`${p}_DB_USER`],
  password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], decimalNumbers: true, dateStrings: true })
const legacy = await conn('LEGACY'), vue = await conn('VUE')
const q = async (c, sql, a = []) => (await c.query(sql, a))[0]
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const IN = (ids) => ids.map(() => '?').join(',') || 'NULL'

// ── 1. what exists only in Vue ──────────────────────────────────────────────
const lOrdNums = new Set((await q(legacy, 'SELECT order_number n FROM credit_orders')).map(r => r.n))
const orders = (await q(vue, 'SELECT id, order_number, customer_id, status, total_amount FROM credit_orders')).filter(o => !lOrdNums.has(o.order_number))
const orderIds = orders.map(o => o.id)

const lPayNums = new Set((await q(legacy, 'SELECT payment_number n FROM customer_payments')).map(r => r.n))
const payments = (await q(vue, 'SELECT id, payment_number, customer_id, amount, order_id, journal_entry_id FROM customer_payments')).filter(p => !lPayNums.has(p.payment_number))
const payIds = payments.map(p => p.id)

const lLed = new Map((await q(legacy, 'SELECT id, customer_id, debit_amount, credit_amount, transaction_date FROM customer_ledger')).map(r => [r.id, r]))
const vLed = await q(vue, 'SELECT id, customer_id, transaction_type, debit_amount, credit_amount, transaction_date, reference_type, reference_id, journal_entry_id FROM customer_ledger')
const sameRow = (a, b) => b && a.customer_id === b.customer_id && Math.abs(a.debit_amount - b.debit_amount) < 0.005 && Math.abs(a.credit_amount - b.credit_amount) < 0.005 && a.transaction_date === b.transaction_date
const orderSet = new Set(orderIds), paySet = new Set(payIds)
// Opening-balance lines added here (type opening_balance) carry a customer's legacy initial_due into the ledger — they stay.
const ledgerOut = vLed.filter(r => r.transaction_type !== 'opening_balance').filter(r => !sameRow(r, lLed.get(r.id))
  || (['credit_order', 'credit_orders'].includes(r.reference_type) && orderSet.has(r.reference_id))
  || (['customer_payment', 'customer_payments'].includes(r.reference_type) && paySet.has(r.reference_id)))
const ledgerIds = ledgerOut.map(r => r.id)

// ── 2. everything that hangs off removed orders (any table with an order_id column) ──────────────
const orderChildTables = (await q(vue, `SELECT DISTINCT TABLE_NAME t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'order_id'
  AND TABLE_NAME NOT IN ('credit_orders', 'customer_payments', 'customer_ledger') AND TABLE_NAME IN (SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE')`)).map(r => r.t)
  .filter(t => !t.startsWith('pos_') && !t.startsWith('commodity_') && !t.startsWith('trading_'))
const del = []   // [{ table, col, ids, note }] in DELETE order (children first)
const add = (table, col, ids) => { ids = [...new Set(ids)]; if (ids.length) del.push({ table, col, ids }) }

// grandchildren first
const deliveries = orderIds.length ? await q(vue, `SELECT id FROM credit_order_deliveries WHERE order_id IN (${IN(orderIds)})`, orderIds) : []
add('credit_order_delivery_items', 'delivery_id', deliveries.map(r => r.id))
const returns = orderIds.length ? await q(vue, `SELECT id FROM credit_order_returns WHERE order_id IN (${IN(orderIds)})`, orderIds) : []
add('credit_order_return_items', 'return_id', returns.map(r => r.id))
const overDel = await q(vue, `SELECT id FROM credit_order_over_deliveries WHERE order_id IN (${IN(orderIds)})`, orderIds).catch(() => [])
add('credit_order_over_delivery_items', 'od_id', overDel.map(r => r.id))
for (const t of orderChildTables) {
  if (['credit_order_delivery_items', 'credit_order_return_items', 'credit_order_deliveries', 'credit_order_returns'].includes(t)) continue   // handled with their parents below
  if (!orderIds.length) break
  const [{ n }] = await q(vue, `SELECT COUNT(*) n FROM \`${t}\` WHERE order_id IN (${IN(orderIds)})`, orderIds).catch(() => [{ n: 0 }])
  if (n) add(t, 'order_id', orderIds)
}
// allocations of removed payments (and of removed orders — covered above via order_id)
add('payment_allocations', 'payment_id', payIds)
// bank rows bridged from removed payments
const bank = payIds.length ? await q(vue, `SELECT id FROM bank_transactions WHERE source_payment_id IN (${IN(payIds)})`, payIds) : []
add('bank_transactions', 'id', bank.map(r => r.id))

// journal entries: those of removed ledger lines / payments / returns, plus ones whose related document was removed
const jeIds = new Set()
for (const r of ledgerOut) if (r.journal_entry_id) jeIds.add(r.journal_entry_id)
for (const p of payments) if (p.journal_entry_id) jeIds.add(p.journal_entry_id)
const relTypes = { credit_orders: orderIds, CreditOrder: orderIds, customer_payments: payIds, CustomerPayment: payIds, credit_order_returns: returns.map(r => r.id), CreditOrderReturn: returns.map(r => r.id) }
for (const [t, ids] of Object.entries(relTypes)) if (ids.length)
  for (const r of await q(vue, `SELECT id FROM journal_entries WHERE related_document_type = ? AND related_document_id IN (${IN(ids)})`, [t, ...ids])) jeIds.add(r.id)
// never remove an entry that legacy also has, unchanged (same id, date and description)
const lJe = new Map((await q(legacy, 'SELECT id, description, transaction_date FROM journal_entries')).map(r => [r.id, r]))
const jeRows = jeIds.size ? await q(vue, `SELECT id, description, transaction_date FROM journal_entries WHERE id IN (${IN([...jeIds])})`, [...jeIds]) : []
const jeOut = jeRows.filter(j => { const l = lJe.get(j.id); return !(l && l.description === j.description && l.transaction_date === j.transaction_date) }).map(j => j.id)
add('transaction_lines', 'journal_entry_id', jeOut)
add('journal_entries', 'id', jeOut)

add('customer_ledger', 'id', ledgerIds)
add('customer_payments', 'id', payIds)
add('credit_order_deliveries', 'id', deliveries.map(r => r.id))   // (children above already queued)
add('credit_order_returns', 'id', returns.map(r => r.id))
add('credit_orders', 'id', orderIds)

// ── 3. report + predicted balances ─────────────────────────────────────────────────────────────────
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN (no writes)'}\n`)
console.log(`Only in Vue: ${orders.length} orders (৳${Math.round(orders.reduce((s, o) => s + o.total_amount, 0)).toLocaleString()}) · ${payments.length} payments (৳${Math.round(payments.reduce((s, p) => s + p.amount, 0)).toLocaleString()}) · ${ledgerOut.length} ledger lines · ${jeOut.length} journal entries\n`)
const counts = []
for (const d of del) {
  const n = d.col === 'id' || d.ids.length ? (await q(vue, `SELECT COUNT(*) n FROM \`${d.table}\` WHERE \`${d.col}\` IN (${IN(d.ids)})`, d.ids))[0].n : 0
  d.count = n; counts.push({ table: d.table, rows: n })
}
console.table(counts.filter(c => c.rows))

const bal = (await q(vue, `SELECT customer_id, SUM(debit_amount - credit_amount) b FROM customer_ledger GROUP BY customer_id`))
const removedNet = new Map(); for (const r of ledgerOut) removedNet.set(r.customer_id, (removedNet.get(r.customer_id) ?? 0) + Number(vLed.find(x => x.id === r.id).debit_amount) - Number(vLed.find(x => x.id === r.id).credit_amount))
const lBal = new Map((await q(legacy, `SELECT c.id, c.initial_due + COALESCE((SELECT SUM(debit_amount - credit_amount) FROM customer_ledger x WHERE x.customer_id = c.id AND x.reference_type <> 'initial_due'), 0) b FROM customers c`)).map(r => [r.id, r.b]))
let still = []
for (const r of bal) { const after = Number(r.b) - (removedNet.get(r.customer_id) ?? 0); const l = lBal.get(r.customer_id); if (l !== undefined && Math.abs(after - l) > 0.5) still.push({ customer: r.customer_id, legacy: Math.round(l), vue_after: Math.round(after), gap: Math.round(after - l) }) }
console.log(`\nAfter this, customers whose balance still differs from legacy: ${still.length}`)
if (still.length) console.table(still.slice(0, 20))

if (!APPLY) { console.log('\nDry run only — re-run with --apply.'); await legacy.end(); await vue.end(); process.exit(0) }

// ── 4. apply: snapshot → delete, one batch ───────────────────────────────────────────────────────────
await vue.beginTransaction()
try {
  const [b] = await vue.query(`INSERT INTO recycle_bin_batches (entity_type, label, customer_id, deleted_by_user_id, deleted_by_name) VALUES ('legacy_alignment', ?, NULL, ?, 'Cutover alignment script')`,
    ['Vue-only pilot records removed to match legacy (cutover)', Number(env.SYNC_FALLBACK_USER_ID ?? 1)])
  const batchId = b.insertId
  for (const d of del) {
    if (!d.count) continue
    for (const idPart of chunk(d.ids, 800)) {
      const rows = await q(vue, `SELECT * FROM \`${d.table}\` WHERE \`${d.col}\` IN (${IN(idPart)})`, idPart)
      for (const rowsPart of chunk(rows, 400)) {
        await vue.query(`INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json) VALUES ${rowsPart.map(() => `(?, ?, 'delete', 'id', ?, ?)`).join(',')}`,
          rowsPart.flatMap(r => [batchId, d.table, String(r.id ?? ''), JSON.stringify(r)]))
      }
      await vue.query(`DELETE FROM \`${d.table}\` WHERE \`${d.col}\` IN (${IN(idPart)})`, idPart)
    }
  }
  await vue.query(`UPDATE recycle_bin_batches SET item_count = (SELECT COUNT(*) FROM recycle_bin_items WHERE batch_id = ?) WHERE id = ?`, [batchId, batchId])
  await vue.query(`UPDATE customers c SET c.current_balance = COALESCE((SELECT SUM(debit_amount - credit_amount) FROM customer_ledger x WHERE x.customer_id = c.id), 0)`)
  await vue.commit()
  console.log(`\nApplied — recycle bin batch #${batchId}.`)
} catch (e) { await vue.rollback(); console.error('ROLLED BACK:', e.message); process.exitCode = 1 }
await legacy.end(); await vue.end()
