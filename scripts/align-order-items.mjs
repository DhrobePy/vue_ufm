#!/usr/bin/env node
/**
 * CUTOVER STEP: remove STALE order lines.
 * Legacy replaces an order's item rows when the order is edited (new ids). The additive sync inserted the new rows but never removed the
 * old ones, so those orders show old + new lines together here (quantities doubled; the order total is still right).
 *
 * For every order that exists in BOTH databases, any credit_order_items row here whose id is not one of legacy's rows for that order is
 * moved to the Recycle Bin (restorable batch) and removed. Dry run by default;  node scripts/align-order-items.mjs --apply
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

const lItems = await q(legacy, 'SELECT id, order_id FROM credit_order_items')
const lIdsByOrder = new Map(); for (const r of lItems) { if (!lIdsByOrder.has(r.order_id)) lIdsByOrder.set(r.order_id, new Set()); lIdsByOrder.get(r.order_id).add(r.id) }
const vItems = await q(vue, 'SELECT * FROM credit_order_items')
const stale = vItems.filter(r => lIdsByOrder.has(r.order_id) && !lIdsByOrder.get(r.order_id).has(r.id))
const orderNo = new Map((await q(vue, 'SELECT id, order_number FROM credit_orders')).map(r => [r.id, r.order_number]))
const byOrder = new Map(); for (const r of stale) byOrder.set(r.order_id, (byOrder.get(r.order_id) ?? 0) + 1)
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'} — ${stale.length} stale line(s) in ${byOrder.size} order(s); qty ${stale.reduce((a, r) => a + Number(r.quantity), 0)}, value ${stale.reduce((a, r) => a + Number(r.line_total), 0)}`)
console.table([...byOrder].slice(0, 8).map(([id, n]) => ({ order: orderNo.get(id), stale_lines: n })))

if (APPLY && stale.length) {
  await vue.beginTransaction()
  try {
    const [b] = await vue.query(`INSERT INTO recycle_bin_batches (entity_type, label, customer_id, deleted_by_user_id, deleted_by_name) VALUES ('legacy_alignment', ?, NULL, ?, 'Cutover alignment script')`,
      ['Old order lines replaced by edits in legacy (cutover)', Number(env.SYNC_FALLBACK_USER_ID ?? 1)])
    for (const part of chunk(stale, 400))
      await vue.query(`INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json) VALUES ${part.map(() => `(?, 'credit_order_items', 'delete', 'id', ?, ?)`).join(',')}`,
        part.flatMap(r => [b.insertId, String(r.id), JSON.stringify(r)]))
    for (const part of chunk(stale.map(r => r.id), 800)) await vue.query(`DELETE FROM credit_order_items WHERE id IN (${part.map(() => '?').join(',')})`, part)
    await vue.query(`UPDATE recycle_bin_batches SET item_count = (SELECT COUNT(*) FROM recycle_bin_items WHERE batch_id = ?) WHERE id = ?`, [b.insertId, b.insertId])
    await vue.commit(); console.log(`Applied — recycle bin batch #${b.insertId}.`)
  } catch (e) { await vue.rollback(); console.error('ROLLED BACK:', e.message); process.exitCode = 1 }
} else if (!APPLY) console.log('\nDry run only — re-run with --apply.')
await legacy.end(); await vue.end()
