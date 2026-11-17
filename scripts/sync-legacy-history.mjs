#!/usr/bin/env node
/**
 * CUTOVER STEP: copy the legacy app's HISTORY into the Vue app so nothing is lost when legacy is retired —
 * audit logs, gate-pass / QR scan logs, production schedule + daily logs, loans.
 *
 * Additive only: a row is inserted when its id is missing in Vue; existing rows are never touched. Columns present in BOTH
 * databases are copied (dates as the raw strings stored, so no time-zone drift); Vue-only columns keep their defaults.
 * Run after sync-legacy-users.mjs (user ids in these tables must exist in Vue).
 *
 *    Dry run by default;  node scripts/sync-legacy-history.mjs --apply
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
const colsOf = async (c, t) => new Set((await q(c, `SELECT COLUMN_NAME c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND (GENERATION_EXPRESSION IS NULL OR GENERATION_EXPRESSION = '')`, [t])).map(r => r.c))

const vueUserIds = new Set((await q(vue, 'SELECT id FROM users')).map(r => Number(r.id)))
const vueOrderIds = new Set((await q(vue, 'SELECT id FROM credit_orders')).map(r => Number(r.id)))
const vueDeliveryIds = new Set((await q(vue, 'SELECT id FROM credit_order_deliveries')).map(r => Number(r.id)))
const userName = new Map((await q(vue, 'SELECT id, display_name FROM users')).map(r => [Number(r.id), r.display_name]))
// A completed legacy batch produced its whole order — fill this app's bags_completed / target_bags so the Production Totals report shows the history.
const orderBags = new Map((await q(vue, 'SELECT order_id, SUM(quantity) b FROM credit_order_items GROUP BY order_id')).map(r => [Number(r.order_id), Math.round(Number(r.b))]))
const userCol = (c) => /(^user_id$|_user_id$|^performed_by_user_id$)/.test(c)

/** table-specific mapping hooks: (row, warn) → row | null */
const hooks = {
  credit_order_audit: (r) => vueOrderIds.has(Number(r.order_id)) ? r : null,
  cr_qr_scan_log: (r) => vueOrderIds.has(Number(r.order_id)) ? r : null,
  cr_delivery_confirmations: (r) => { if (!vueOrderIds.has(Number(r.order_id))) return null; if (r.delivery_id != null && !vueDeliveryIds.has(Number(r.delivery_id))) r.delivery_id = null; return r },
  production_schedule: (r) => (r.order_id == null || vueOrderIds.has(Number(r.order_id))) ? { ...r, target_bags: orderBags.get(Number(r.order_id)) ?? null, bags_completed: r.status === 'completed' ? (orderBags.get(Number(r.order_id)) ?? 0) : 0 } : null,
  production_daily_log: (r) => ({ ...r, performed_by_user_id: r.user_id ?? null, performed_by_name: userName.get(Number(r.user_id)) ?? null, performed_at: r.created_at ?? null }),
  loans: (r) => r,
}
const TABLES = ['system_audit_log', 'credit_order_audit', 'bank_tx_audit_log', 'cr_qr_scan_log', 'cr_delivery_confirmations',
  'production_schedule', 'production_daily_log', 'production_daily_stock', 'loans']

const report = []
const warnings = []
if (APPLY) await vue.beginTransaction()
try {
  for (const table of TABLES) {
    const [lc, vc] = [await colsOf(legacy, table), await colsOf(vue, table)]
    const shared = [...lc].filter(c => vc.has(c))
    const extra = table === 'production_daily_log' ? ['performed_by_user_id', 'performed_by_name', 'performed_at'] : table === 'production_schedule' ? ['target_bags', 'bags_completed'] : []
    const legacyNeeded = table === 'production_daily_log' ? [...new Set([...shared, 'user_id', 'created_at'])] : shared
    const vIds = new Set((await q(vue, `SELECT id FROM \`${table}\``)).map(r => String(r.id)))
    const lIds = (await q(legacy, `SELECT id FROM \`${table}\` ORDER BY id`)).map(r => String(r.id)).filter(i => !vIds.has(i))
    let inserted = 0, skipped = 0
    for (const idPart of chunk(lIds, 2000)) {
      const rows = await q(legacy, `SELECT ${legacyNeeded.map(c => `\`${c}\``).join(',')} FROM \`${table}\` WHERE id IN (${idPart.map(() => '?').join(',')}) ORDER BY id`, idPart)
      const out = []
      for (const r0 of rows) {
        let r = { ...r0 }
        for (const c of Object.keys(r)) if (userCol(c) && r[c] != null && !vueUserIds.has(Number(r[c]))) { warnings.push(`${table} #${r.id}: ${c} ${r[c]} not in vue — set NULL`); r[c] = null }
        r = hooks[table] ? hooks[table](r) : r
        if (r === null) { skipped++; continue }
        out.push(r)
      }
      if (!out.length) continue
      const cols = [...new Set([...shared, ...extra])].filter(c => c in out[0])
      inserted += out.length
      if (APPLY) for (const part of chunk(out, Math.max(1, Math.floor(5000 / cols.length))))
        await vue.query(`INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES ${part.map(() => `(${cols.map(() => '?').join(',')})`).join(',')}`, part.flatMap(r => cols.map(c => r[c] ?? null)))
    }
    report.push({ table, missing: lIds.length, inserted, skipped })
  }
  if (APPLY) await vue.commit()
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`); console.table(report)
  if (warnings.length) { console.log(`${warnings.length} warning(s):`); for (const w of [...new Set(warnings)].slice(0, 15)) console.log(' -', w) }
  if (!APPLY) console.log('\nDry run only — re-run with --apply.')
} catch (e) { if (APPLY) await vue.rollback(); console.error('FAILED:', e.message); process.exitCode = 1 }
await legacy.end(); await vue.end()
