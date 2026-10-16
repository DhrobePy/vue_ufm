#!/usr/bin/env node
/**
 * Prepares the "true ledger" review. NOTHING IS DELETED and no balance changes except where stated:
 *   1. flags every Vue-only ledger line (pilot period / deleted in legacy) review_status='review' so a reviewer can Keep or Delete it
 *   2. flags suspicious legacy lines too (possible duplicates, invoices for draft/cancelled orders, lines with no customer)
 *   3. restores the one legacy line lost to an id clash (#1929) — legacy's own line, status 'ok'
 *   4. adds the 28 missing opening lines (legacy shows these through the customer record), flagged 'review'
 *   5. re-derives customers.current_balance from the ledger
 *   node scripts/flag-ledger-review.mjs            dry run      |      --apply   write (one transaction)
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const APPLY = process.argv.includes('--apply')
const dir = dirname(fileURLToPath(import.meta.url))
const env = { ...Object.fromEntries((existsSync(join(dir, '.env.sync')) ? readFileSync(join(dir, '.env.sync'), 'utf8') : '').split('\n')
  .map(l => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])), ...process.env }
const open = (p) => mysql.createConnection({ host: env[`${p}_DB_HOST`] ?? '127.0.0.1', port: Number(env[`${p}_DB_PORT`] ?? 3307), user: env[`${p}_DB_USER`],
  password: env[`${p}_DB_PASS`], database: env[`${p}_DB_NAME`], decimalNumbers: true, dateStrings: true })
const [legacy, vue] = [await open('LEGACY'), await open('VUE')]
const PILOT_END = '2026-07-24'

// make sure the review columns exist (the app adds them on start too — this just lets the script run first)
for (const [c, d] of [['review_status', "VARCHAR(10) NOT NULL DEFAULT 'ok'"], ['review_reason', 'VARCHAR(40) NULL'], ['reviewed_by_user_id', 'BIGINT UNSIGNED NULL'], ['reviewed_at', 'DATETIME NULL'], ['review_note', 'VARCHAR(255) NULL']]) {
  const [[x]] = await vue.query(`SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_ledger' AND COLUMN_NAME = ?`, [c])
  if (!x.n && APPLY) await vue.query(`ALTER TABLE customer_ledger ADD COLUMN \`${c}\` ${d}`)
}
const hasCols = (await vue.query(`SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_ledger' AND COLUMN_NAME = 'review_status'`))[0][0].n > 0

const [lRows] = await legacy.query('SELECT * FROM customer_ledger')
const [vRows] = await vue.query('SELECT * FROM customer_ledger')
const lById = new Map(lRows.map(r => [String(r.id), r]))
const identical = (l, v) => l && l.customer_id === v.customer_id && Math.abs(l.debit_amount - v.debit_amount) < 0.001 && Math.abs(l.credit_amount - v.credit_amount) < 0.001 && String(l.transaction_date) === String(v.transaction_date)

const flags = new Map()   // vue row id -> reason
const flag = (id, reason) => { if (!flags.has(String(id))) flags.set(String(id), reason) }
for (const v of vRows) if (!identical(lById.get(String(v.id)), v)) flag(v.id, String(v.transaction_date) <= PILOT_END ? 'PILOT_ERA' : 'NOT_IN_LEGACY')
// customer 0 / missing customer
const [cust] = await vue.query('SELECT id, name, initial_due FROM customers')
const custIds = new Set(cust.map(c => c.id))
for (const v of vRows) if (!custIds.has(v.customer_id)) flag(v.id, 'NO_CUSTOMER')
// possible duplicates: flag every line after the first of identical (customer, date, type, amounts, reference)
const seen = new Map()
for (const v of [...vRows].sort((a, b) => a.id - b.id)) {
  const k = [v.customer_id, v.transaction_date, v.transaction_type, v.debit_amount, v.credit_amount, v.invoice_number ?? ''].join('|')
  if (seen.has(k) && v.transaction_type !== 'opening_balance') flag(v.id, 'DUPLICATE?'); else seen.set(k, v.id)
}
// invoices for orders that are not dispatched
const [badInv] = await vue.query(`SELECT l.id FROM customer_ledger l JOIN credit_orders o ON o.id = l.reference_id
   WHERE l.reference_type IN ('credit_orders','credit_order') AND l.transaction_type = 'invoice' AND o.status IN ('draft','cancelled','rejected')`)
for (const r of badInv) flag(r.id, 'INVOICE_ORDER_NOT_SHIPPED')

// the legacy line lost to an id clash
// (a legacy line whose id simply is not in Vue yet is left to the normal sync, which keeps its id)
const lost = lRows.filter(l => { const v = vRows.find(x => String(x.id) === String(l.id)); return v && !identical(l, v) })
// the 28 missing opening lines
const openingMissing = cust.filter(c => c.initial_due !== 0 && !vRows.some(v => v.customer_id === c.id && v.transaction_type === 'opening_balance'))

const byReason = {}; for (const r of flags.values()) byReason[r] = (byReason[r] ?? 0) + 1
console.log('Lines to flag for review:', flags.size); console.table(byReason)
console.log(`Legacy lines missing from Vue (id clash) to restore: ${lost.length}`, lost.map(l => `#${l.id} (customer ${l.customer_id}, ৳${l.debit_amount || l.credit_amount})`).join('; '))
console.log(`Opening lines to add (flagged for review): ${openingMissing.length}, net ৳${openingMissing.reduce((s, c) => s + c.initial_due, 0).toLocaleString()}`)
const [[drift]] = await vue.query(`SELECT COUNT(*) n FROM customers c LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id WHERE ABS(c.current_balance - COALESCE(l.b, 0)) > 0.01`)
console.log(`Customers whose stored balance will be re-derived from the ledger: ${drift.n} (more after the additions above)`)
if (!hasCols) console.log('(review columns not created yet — they are created when you --apply)')

if (!APPLY) { console.log('\nDry run only — nothing written.'); await legacy.end(); await vue.end(); process.exit(0) }

await vue.query('ALTER TABLE customer_ledger AUTO_INCREMENT = 1000000')   // DDL (commits) — before the transaction
await vue.beginTransaction()
try {
  const byR = new Map()
  for (const [id, reason] of flags) { (byR.get(reason) ?? byR.set(reason, []).get(reason)).push(id) }
  for (const [reason, ids] of byR) await vue.query(`UPDATE customer_ledger SET review_status = 'review', review_reason = ? WHERE id IN (?) AND review_status = 'ok'`, [reason, ids])
  for (const l of lost) {
    const { id, ...rest } = l
    const cols = Object.keys(rest).filter(c => !['review_status', 'review_reason', 'reviewed_by_user_id', 'reviewed_at', 'review_note'].includes(c))
    const vueCols = new Set((await vue.query(`SELECT COLUMN_NAME n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_ledger'`))[0].map(r => r.n))
    const use = cols.filter(c => vueCols.has(c))
    await vue.query(`INSERT INTO customer_ledger (${use.map(c => `\`${c}\``).join(',')}) VALUES (${use.map(() => '?').join(',')})`, use.map(c => rest[c]))
  }
  for (const c of openingMissing) {
    const amt = Math.abs(c.initial_due)
    await vue.query(
      `INSERT INTO customer_ledger (customer_id, transaction_date, transaction_type, reference_type, reference_id, invoice_number, description,
                                    debit_amount, credit_amount, balance_after, created_by_user_id, review_status, review_reason)
       VALUES (?, '2026-06-18', 'opening_balance', 'initial_due', ?, ?, ?, ?, ?, ?, 1, 'review', 'OPENING_RESTORED')`,
      [c.id, c.id, `OB-INITIAL-${c.id}-20260618`, `Opening balance – ${c.initial_due > 0 ? 'Previous due' : 'Advance payment'} carried forward – ${c.name} (restored from the customer record)`,
       c.initial_due > 0 ? amt : 0, c.initial_due < 0 ? amt : 0, c.initial_due])
  }
  await vue.query(`UPDATE customers c LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
                   SET c.current_balance = COALESCE(l.b, 0) WHERE ABS(c.current_balance - COALESCE(l.b, 0)) > 0.005`)
  await vue.commit()
  console.log('\nApplied.')
} catch (e) { await vue.rollback(); console.error('FAILED, nothing written:', e.message); process.exit(1) }
await legacy.end(); await vue.end()
