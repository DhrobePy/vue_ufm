#!/usr/bin/env node
/**
 * CUTOVER STEP: bring legacy users and their approval / action limits into the Vue app.
 *
 *  • A legacy user is matched to a Vue user by EMAIL (case-insensitive). Missing ones are created — same id when it is free in Vue,
 *    otherwise a new id (legacy #4, #9 and #27 are different people in Vue). Existing Vue users are never changed.
 *  • The bcrypt hash is copied, so people sign in with the password they already use. The legacy plaintext column is NOT copied.
 *  • user_approval_limits / user_action_limits are copied for every matched or created user that has none in Vue yet.
 *  • Page/module permissions are NOT translated (the two apps model them differently) — a per-user comparison is printed instead.
 *
 *    Dry run by default;  node scripts/sync-legacy-users.mjs --apply
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
const CAP = 999_999_999_999.99   // vue's DECIMAL(14,2) ceiling — legacy used absurdly large numbers to mean "no limit"

const lUsers = await q(legacy, 'SELECT * FROM users ORDER BY id')
const vUsers = await q(vue, 'SELECT id, uuid, email, role, status FROM users')
const vByUuid = new Map(vUsers.filter(u => u.uuid).map(u => [u.uuid, u]))
const vByEmail = new Map(vUsers.map(u => [String(u.email).toLowerCase(), u]))
const vIds = new Set(vUsers.map(u => Number(u.id)))
const map = new Map()   // legacy id → vue id
const created = []
const renamed = []

if (APPLY) await vue.beginTransaction()
try {
  for (const u of lUsers) {
    // Same person = same uuid (an email may have been renamed on one side) or same email.
    const hit = vByUuid.get(u.uuid) ?? vByEmail.get(String(u.email).toLowerCase())
    if (hit) {
      map.set(Number(u.id), Number(hit.id))
      if (String(hit.email).toLowerCase() !== String(u.email).toLowerCase()) renamed.push({ legacy_id: u.id, vue_id: hit.id, legacy_email: u.email, vue_email: hit.email, role: hit.role })
      continue
    }
    const keepId = !vIds.has(Number(u.id))
    const cols = ['uuid', 'display_name', 'email', 'password_hash', 'role', 'status', 'created_at']
    const vals = [u.uuid, u.display_name, u.email, u.password_hash, u.role, u.status, u.created_at]
    let newId = Number(u.id)
    if (APPLY) {
      const [r] = await vue.query(`INSERT INTO users (${keepId ? 'id, ' : ''}${cols.join(', ')}) VALUES (${keepId ? '?, ' : ''}${cols.map(() => '?').join(', ')})`, [...(keepId ? [u.id] : []), ...vals])
      newId = Number(r.insertId || u.id)
    } else if (!keepId) newId = -1
    map.set(Number(u.id), newId); vIds.add(newId)
    created.push({ legacy_id: u.id, vue_id: APPLY ? newId : (keepId ? u.id : 'new'), name: u.display_name, email: u.email, role: u.role, status: u.status })
  }

  const limits = []
  for (const [table, key] of [['user_approval_limits', null], ['user_action_limits', 'action_key']]) {
    const rows = await q(legacy, `SELECT * FROM ${table}`)
    for (const r of rows) {
      const vid = map.get(Number(r.user_id))
      if (!vid) { limits.push({ table, legacy_user: r.user_id, result: 'user not found — skipped' }); continue }
      const [ex] = await q(vue, `SELECT id FROM ${table} WHERE user_id = ?${key ? ' AND action_key = ?' : ''}`, key ? [vid, r[key]] : [vid]).then(x => x.length ? x : [null])
      if (ex) { limits.push({ table, legacy_user: r.user_id, vue_user: vid, result: 'already set in Vue — left' }); continue }
      limits.push({ table, legacy_user: r.user_id, vue_user: vid, result: APPLY ? 'copied' : 'would copy', amount: r.max_order_amount ?? r.max_amount, action: r[key] ?? 'approve orders' })
      if (APPLY) {
        if (key) await vue.query(`INSERT INTO ${table} (user_id, action_key, max_amount, set_by_user_id) VALUES (?, ?, ?, ?)`, [vid, r.action_key, Math.min(Number(r.max_amount), CAP), map.get(Number(r.set_by_user_id)) ?? null])
        else await vue.query(`INSERT INTO ${table} (user_id, max_order_amount, set_by_user_id) VALUES (?, ?, ?)`, [vid, Math.min(Number(r.max_order_amount), CAP), map.get(Number(r.set_by_user_id)) ?? null])
      }
    }
  }
  if (APPLY) await vue.commit()

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n\nUsers created in Vue: ${created.length}`)
  if (created.length) console.table(created)
  if (renamed.length) { console.log('\nSame person, different login email in the two apps (Vue keeps its own):'); console.table(renamed) }
  console.log('Limits:'); console.table(limits)

  // permissions comparison (printed, not written)
  const perms = await q(legacy, 'SELECT user_id, module, is_module_enabled e FROM user_custom_permissions ORDER BY user_id, module')
  const by = new Map()
  for (const p of perms) { const k = Number(p.user_id); if (!by.has(k)) by.set(k, []); by.get(k).push(`${p.module}${p.e ? '' : ' (off)'}`) }
  console.log('\nLegacy per-user module access (set these in Admin → Users → Permissions if they differ from the role default):')
  for (const [uid, mods] of by) { const u = lUsers.find(x => Number(x.id) === uid); console.log(`  ${u?.email ?? uid} [${u?.role}] → ${mods.join(', ')}`) }
  if (!APPLY) console.log('\nDry run only — re-run with --apply.')
} catch (e) { if (APPLY) await vue.rollback(); console.error('FAILED:', e.message); process.exitCode = 1 }
await legacy.end(); await vue.end()
