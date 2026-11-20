#!/usr/bin/env node
/**
 * CUTOVER STEP: bring rows that were EDITED in legacy after they were first synced up to date.
 * The additive syncs insert missing rows but never revisit existing ones, so in Vue: credit limits and customer details are
 * stale, approved expense vouchers still read "pending", approved returns still read "pending", edited bank rows keep old amounts.
 *
 * For each table below, the listed columns of every row with the same id are set to legacy's value where they differ.
 * Legacy is the system of record at cutover, so it wins. Columns that are rewritten on purpose when rows are copied
 * (user ids, account ids, running balances, provenance notes) are not in the lists.
 *
 *    Dry run by default;  node scripts/catchup-edits.mjs --apply
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

const userIds = new Set((await q(vue, 'SELECT id FROM users')).map(r => Number(r.id)))
const jeIds = new Set((await q(vue, 'SELECT id FROM journal_entries')).map(r => Number(r.id)))
const present = async (c, t) => new Set((await q(c, `SELECT COLUMN_NAME c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [t])).map(r => r.c))

const PLAN = {
  customers: ['name', 'business_name', 'phone_number', 'email', 'business_address', 'credit_limit', 'status', 'customer_type', 'payment_terms'],
  expense_vouchers: ['status', 'approved_at', 'approved_by_user_id', 'rejection_reason', 'telegram_notified', 'journal_entry_id'],
  credit_order_returns: ['status', 'approved_by_user_id', 'approved_at', 'notes'],
  goods_received_adnan: ['grn_status', 'quantity_received_kg', 'unit_price_per_kg', 'total_value', 'expected_quantity', 'variance_percentage', 'variance_remarks', 'unload_point_name', 'verified_by_user_id', 'verified_at'],
  bank_transactions: ['transaction_type_id', 'amount', 'status', 'approved_by_user_id', 'approved_at', 'updated_by_user_id', 'rejection_reason', 'description', 'special_note', 'reference_number', 'cheque_number'],
  bank_tx_accounts: ['bank_name', 'branch_name', 'account_name', 'account_number', 'address', 'status', 'notes'],
  expense_categories: ['is_active'],
  expense_subcategories: ['is_active'],
  loans: ['status', 'amount_repaid', 'balance_due'],
  // shipping rows were re-numbered here, so they are matched by order, not by id (one shipping row per order in legacy)
  credit_order_shipping: { key: 'order_id', cols: ['shipped_date', 'delivered_date', 'truck_number', 'driver_name', 'driver_contact', 'delivery_notes'] },
}
const userCol = (c) => /(_user_id)$/.test(c)
const summary = [], samples = []
if (APPLY) await vue.beginTransaction()
try {
  for (const [table, spec] of Object.entries(PLAN)) {
    const wanted = Array.isArray(spec) ? spec : spec.cols, K = Array.isArray(spec) ? 'id' : spec.key
    const [lc, vc] = [await present(legacy, table), await present(vue, table)]
    const cols = wanted.filter(c => lc.has(c) && vc.has(c))
    if (!cols.length) continue
    const lMap = new Map((await q(legacy, `SELECT \`${K}\`, ${cols.map(c => `\`${c}\``).join(',')} FROM \`${table}\``)).map(r => [String(r[K]), r]))
    const vRows = await q(vue, `SELECT id, \`${K}\`, ${cols.map(c => `\`${c}\``).join(',')} FROM \`${table}\``)
    let rows = 0; const byCol = {}
    for (const v of vRows) {
      const l = lMap.get(String(v[K])); if (!l) continue
      const sets = {}
      for (const c of cols) {
        let nv = l[c]
        if (userCol(c) && nv != null && !userIds.has(Number(nv))) continue            // user not in Vue — leave
        if (c === 'journal_entry_id' && nv != null && !jeIds.has(Number(nv))) continue // entry not in Vue — leave
        if (c === 'journal_entry_id' && v[c] != null) continue                          // never swap an entry that is already linked
        const same = typeof nv === 'number' && typeof v[c] === 'number' ? Math.abs(nv - v[c]) < 0.005 : String(nv ?? '') === String(v[c] ?? '')
        if (!same) sets[c] = nv
      }
      const keys = Object.keys(sets); if (!keys.length) continue
      rows++; keys.forEach(k => byCol[k] = (byCol[k] || 0) + 1)
      if (samples.filter(s => s.table === table).length < 2) samples.push({ table, id: v.id, change: keys.map(k => `${k}: ${v[k]} → ${sets[k]}`).join('; ').slice(0, 110) })
      if (APPLY) await vue.query(`UPDATE \`${table}\` SET ${keys.map(k => `\`${k}\` = ?`).join(', ')} WHERE id = ?`, [...keys.map(k => sets[k]), v.id])
    }
    if (rows) summary.push({ table, rows, columns: Object.entries(byCol).map(([c, n]) => `${c}×${n}`).join(' ') })
  }
  if (APPLY) {
    await vue.query(`UPDATE customers c SET c.current_balance = COALESCE((SELECT SUM(debit_amount - credit_amount) FROM customer_ledger x WHERE x.customer_id = c.id), 0)`)
    await vue.commit()
  }
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`); console.table(summary); console.table(samples)
  if (!APPLY) console.log('\nDry run only — re-run with --apply.')
} catch (e) { if (APPLY) await vue.rollback(); console.error('FAILED:', e.message); process.exitCode = 1 }
await legacy.end(); await vue.end()
