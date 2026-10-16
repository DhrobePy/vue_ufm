#!/usr/bin/env node
/**
 * Additive, repeatable sync of transactional data from the legacy PHP app's
 * database (ujjalfmc_saas) into the Vue app's live database
 * (ujjalfmc_vue_ufm), while legacy remains the system of record and Vue is
 * being caught up ahead of full cutover.
 *
 * SAME core rule as the earlier master-data sync: additive only. A row is
 * only inserted if its `id` does not already exist in the vue table. Nothing
 * that already exists in vue is ever touched. IDs are preserved as-is
 * (verified: the two databases share a common origin, so ids line up 1:1 for
 * shared entities — see the users/branches/positions safety checks below).
 *
 * Tables synced, in FK-safe order:
 *   credit_orders -> credit_order_items -> credit_order_deliveries ->
 *   credit_order_delivery_items -> credit_order_workflow -> journal_entries
 *   -> transaction_lines -> customer_ledger -> suppliers ->
 *   purchase_commodities -> purchase_commodity_origins ->
 *   purchase_orders_adnan -> purchase_payments_adnan ->
 *   purchase_adjustment_notes -> expense_vouchers
 *
 * Every id-reference a child makes into a parent (order_id, delivery_id,
 * journal_entry_id) is validated against a "safe parent id" set — either the
 * parent was just inserted this run, or it already existed on both sides AND
 * a natural-key check confirms it's genuinely the same row. This matters:
 * verified live that legacy and vue only share ~3% of credit_orders ids by
 * coincidence-free overlap, and 9 of 5644 shared journal_entries ids turned
 * out to be two completely unrelated entries that happen to share an
 * auto-increment id. Blindly trusting "id exists in vue" would have
 * attached legacy child rows to the wrong, unrelated vue parent.
 *
 * NOT synced (deliberately):
 *   - cr_delivery_confirmations: vue-specific QR/gate-pass table, different
 *     schema (int vs bigint ids, datetime vs timestamp), tied to vue's own
 *     live scanning activity — not backfill material.
 *   - purchases/expenses: separate follow-up, not yet covered by this script.
 *
 * user_id safety: any column referencing `users.id` (created_by_user_id,
 * performed_by_user_id, approved_by_user_id, responsible_employee_id, etc.)
 * is only carried over as-is if that id resolves to the SAME email in both
 * databases. Otherwise it's remapped to SYNC_FALLBACK_USER_ID and the
 * original legacy display name is appended to the row's own text field
 * (comments/description/notes) so provenance isn't lost.
 *
 * Usage:
 *   1. cp scripts/.env.sync.example scripts/.env.sync   (fill in real creds)
 *   2. Open an SSH tunnel to the server's MySQL:
 *        ssh -i ~/.ssh/ujjalfm_cpanel_deploy_key2 -L 3307:localhost:3306 \
 *            ujjalfmc@151.158.44.77 -N
 *   3. Dry run (default, no writes):
 *        node scripts/sync-legacy-transactional.mjs
 *   4. Apply for real:
 *        node scripts/sync-legacy-transactional.mjs --apply
 */
import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APPLY = process.argv.includes('--apply')

// ---- tiny .env loader (no extra dependency) --------------------------------
function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
  return out
}
const env = { ...loadEnvFile(join(__dirname, '.env.sync')), ...process.env }
function need(key, fallback) {
  const v = env[key] ?? fallback
  if (v === undefined) throw new Error(`Missing required env var ${key} (see scripts/.env.sync.example)`)
  return v
}

const FALLBACK_USER_ID = Number(env.SYNC_FALLBACK_USER_ID ?? 1)

const connOpts = (prefix) => ({
  host: need(`${prefix}_DB_HOST`, '127.0.0.1'),
  port: Number(need(`${prefix}_DB_PORT`, 3307)),
  user: need(`${prefix}_DB_USER`),
  password: need(`${prefix}_DB_PASS`),
  database: need(`${prefix}_DB_NAME`),
  timezone: '+00:00',
  dateStrings: true,       // keep dates/timestamps as raw strings — no JS Date round-trip
  decimalNumbers: false,   // keep decimals as strings — no float precision surprises
  charset: 'utf8mb4',
})

const report = { tables: [], warnings: [] }

function esc(v) {
  return v // mysql2 query() with placeholders handles escaping; this is just a marker for readability
}

async function idSet(conn, table) {
  const [rows] = await conn.query(`SELECT id FROM \`${table}\``)
  return new Set(rows.map(r => String(r.id)))
}

async function buildUserSafetyMap(legacy, vue) {
  const [legacyUsers] = await legacy.query('SELECT id, email FROM users')
  const [vueUsers] = await vue.query('SELECT id, email FROM users')
  const vueById = new Map(vueUsers.map(u => [String(u.id), (u.email || '').toLowerCase()]))
  const legacyById = new Map(legacyUsers.map(u => [String(u.id), u]))
  const safe = new Set()
  for (const u of legacyUsers) {
    const vueEmail = vueById.get(String(u.id))
    if (vueEmail && vueEmail === (u.email || '').toLowerCase()) safe.add(String(u.id))
  }
  return {
    isSafe: (id) => id == null || safe.has(String(id)),
    displayNameOf: (id) => legacyById.get(String(id))?.display_name ?? `user #${id}`,
  }
}

/** Resolve a user_id field: pass through if safe, else fallback + note. */
function mapUser(userMap, id, noteParts) {
  if (id == null) return { value: null, note: null }
  if (userMap.isSafe(id)) return { value: id, note: null }
  const name = userMap.displayNameOf(id)
  noteParts?.push(`orig. by ${name} (legacy user #${id})`)
  return { value: FALLBACK_USER_ID, note: `orig. by ${name} (legacy user #${id})` }
}

async function existingIds(conn, table) {
  return idSet(conn, table)
}

/**
 * Build the set of parent ids that are SAFE for a child row to reference:
 * either the id is being freshly inserted this run (definitely the same
 * row), or it already existed on both sides AND a natural-key check confirms
 * it's genuinely the same real-world row (not just a coincidentally-reused
 * auto-increment id — verified this happens: e.g. 9 of 5644 shared
 * journal_entries ids point to completely unrelated entries on each side).
 */
async function buildSafeParentIds(legacy, vue, table, missingIds, naturalKeyCols) {
  const resolved = new Map() // legacy id (string) -> the vue id a child should actually use
  for (const id of missingIds) resolved.set(String(id), String(id))
  const [lRows] = await legacy.query(`SELECT id, ${naturalKeyCols.join(',')} FROM \`${table}\``)
  const [vRows] = await vue.query(`SELECT id, ${naturalKeyCols.join(',')} FROM \`${table}\``)
  const keyOf = (r) => naturalKeyCols.map(c => String(r[c])).join('|')
  const vById = new Map(vRows.map(r => [String(r.id), keyOf(r)]))
  const vByKey = new Map()
  for (const r of vRows) { const k = keyOf(r); if (!vByKey.has(k)) vByKey.set(k, String(r.id)) }
  let mismatches = 0, remapped = 0
  for (const r of lRows) {
    const id = String(r.id)
    if (resolved.has(id)) continue // already counted as a fresh insert
    const vKey = vById.get(id)
    if (vKey === undefined) continue // not shared, not missing => doesn't exist in legacy's own "missing" computation edge case; skip
    const lKey = keyOf(r)
    // Exact match, OR vue's key is legacy's key with a " | orig. by ..."
    // provenance note appended (this script's own transform does that when
    // remapping an unsafe user_id) — still the same row, not a collision.
    if (vKey === lKey || vKey.startsWith(`${lKey} | `)) { resolved.set(id, id); continue }
    // Collision: id exists in both but is a different row (verified this
    // happens — 9 journal_entries, 8 chart_of_accounts, 8 bank_accounts).
    // If the TRUE row was separately backfilled under a new id (as done for
    // chart_of_accounts/bank_accounts after finding this), use that instead
    // of losing the reference.
    const trueId = vByKey.get(lKey)
    if (trueId !== undefined) { resolved.set(id, trueId); remapped++ }
    else mismatches++
  }
  if (mismatches) report.warnings.push(`${table}: ${mismatches} shared id(s) point to a DIFFERENT row in vue, and no matching row found elsewhere — excluded from safe-reference set`)
  if (remapped) report.warnings.push(`${table}: ${remapped} shared id(s) were a coincidental collision but the real row exists in vue under a different id — references remapped automatically`)
  return {
    has: (id) => resolved.has(String(id)),
    resolve: (id) => resolved.get(String(id)),
  }
}

/**
 * Generic sync of one table, additive-only, matched by id.
 * @param opts.columns   columns to SELECT from legacy, in insert order
 * @param opts.transform (row, ctx) => row for vue, or null to skip the row (with a warning)
 */
async function presentColumns(conn, table) {
  const [r] = await conn.query(`SELECT COLUMN_NAME c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [table])
  return new Set(r.map(x => x.c))
}

async function syncTable(legacy, vue, { table, columns, optional = [], transform, note }) {
  // `optional` columns are copied only when BOTH databases have them (newer features, e.g. delivery slip numbers).
  if (optional.length) {
    const [lc, vc] = [await presentColumns(legacy, table), await presentColumns(vue, table)]
    columns = [...columns, ...optional.filter(c => lc.has(c) && vc.has(c))]
  }
  const legacyIds = await idSet(legacy, table)
  const vueIds = await idSet(vue, table)
  const missing = [...legacyIds].filter(id => !vueIds.has(id)).sort((a, b) => Number(a) - Number(b))

  if (missing.length === 0) {
    report.tables.push({ table, missing: 0, inserted: 0, skipped: 0 })
    return new Set()
  }

  const colList = columns.join(', ')
  const [rows] = await legacy.query(
    `SELECT ${colList} FROM \`${table}\` WHERE id IN (${missing.map(() => '?').join(',')}) ORDER BY id`,
    missing,
  )

  const toInsert = []
  let skipped = 0
  for (const row of rows) {
    const mapped = transform ? await transform(row) : row
    if (mapped === null) { skipped++; continue }
    toInsert.push(mapped)
  }

  report.tables.push({ table, missing: missing.length, inserted: toInsert.length, skipped, note })

  // The set of ids that WILL exist in vue after this call (in apply mode) or
  // WOULD exist (dry run) — used by callers to validate child rows' FK-ish
  // references, regardless of which mode we're running in.
  const insertedIds = new Set(toInsert.map(r => String(r.id)))

  if (!APPLY || toInsert.length === 0) return insertedIds

  const outCols = Object.keys(toInsert[0])
  const placeholders = `(${outCols.map(() => '?').join(',')})`
  // MySQL caps a prepared statement at 65535 placeholders — batch well under
  // that (some of these tables run 8000+ rows x 10+ cols).
  const rowsPerBatch = Math.max(1, Math.floor(5000 / outCols.length))
  for (let i = 0; i < toInsert.length; i += rowsPerBatch) {
    const batch = toInsert.slice(i, i + rowsPerBatch)
    const sql = `INSERT INTO \`${table}\` (${outCols.map(c => `\`${c}\``).join(',')}) VALUES ${batch.map(() => placeholders).join(',')}`
    const values = batch.flatMap(r => outCols.map(c => r[c] ?? null))
    await vue.query(sql, values)
  }
  return insertedIds
}

/** Check referenced ids exist in a vue table; returns a Set for O(1) lookup. */
async function refSet(vue, table) {
  return idSet(vue, table)
}

/**
 * Additive sync for tables where id-preservation is NOT safe — verified this
 * for chart_of_accounts (8 collisions) and bank_accounts (8 collisions, then
 * a 9th one level deeper: fixing those 8 via auto-increment happened to
 * reassign vue ids that collided with legacy's own next id). Never trusts or
 * preserves `id`; matches purely by natural key, and always inserts new rows
 * via auto-increment, returning a legacy-id -> vue-id resolver built from
 * BOTH pre-existing correct matches and freshly-inserted rows.
 *
 * `columns` must NOT include 'id'. `naturalKeyCols` are read from vue only
 * (existing rows) to detect an already-present match by value, not by id.
 */
async function syncTableAutoId(legacy, vue, { table, columns, naturalKeyCols, transform, note }) {
  const [lRows] = await legacy.query(`SELECT id AS legacy_id, ${columns.join(',')} FROM \`${table}\``)
  const [vRows] = await vue.query(`SELECT id, ${naturalKeyCols.join(',')} FROM \`${table}\``)
  const keyOf = (r) => naturalKeyCols.map(c => String(r[c])).join('|')
  const vByKey = new Map()
  for (const r of vRows) { const k = keyOf(r); if (!vByKey.has(k)) vByKey.set(k, String(r.id)) }

  const idMap = new Map() // legacy_id (string) -> vue id (string) — pre-existing matches, filled in immediately
  const toInsert = [] // { legacyId, data } — genuinely new, to be inserted (or would be, in dry run)
  for (const row of lRows) {
    const { legacy_id, ...rest } = row
    const existingVueId = vByKey.get(keyOf(rest))
    if (existingVueId !== undefined) { idMap.set(String(legacy_id), existingVueId); continue }
    const mapped = transform ? await transform(rest) : rest
    if (mapped === null) continue // caller skipped this row entirely (rare — no NOT NULL field would allow it anyway)
    toInsert.push({ legacyId: legacy_id, data: mapped })
  }

  report.tables.push({ table, missing: toInsert.length, inserted: toInsert.length, skipped: 0, note })

  if (APPLY) {
    for (const item of toInsert) {
      const cols = Object.keys(item.data)
      const [result] = await vue.query(
        `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
        cols.map(c => item.data[c] ?? null),
      )
      idMap.set(String(item.legacyId), String(result.insertId))
    }
  } else {
    // Dry run: the real id doesn't exist yet — use a placeholder so has()/
    // resolve() still work for reporting purposes within this same run.
    for (const item of toInsert) idMap.set(String(item.legacyId), `NEW#${item.legacyId}`)
  }

  return {
    has: (id) => idMap.has(String(id)),
    resolve: (id) => idMap.get(String(id)),
  }
}

async function main() {
  const legacy = await mysql.createConnection(connOpts('LEGACY'))
  const vue = await mysql.createConnection(connOpts('VUE'))

  console.log(`Mode: ${APPLY ? 'APPLY (writing to vue)' : 'DRY RUN (no writes)'}\n`)

  const userMap = await buildUserSafetyMap(legacy, vue)
  const vueProductIds = await refSet(vue, 'products')
  const vueVariantIds = await refSet(vue, 'product_variants')
  const vueCommodityIds = await refSet(vue, 'purchase_commodities').catch(() => new Set())
  const vueBranchIds = await refSet(vue, 'branches')

  if (APPLY) await vue.beginTransaction()

  try {
    // ---- credit_orders --------------------------------------------------
    const insertedOrderIds = await syncTable(legacy, vue, {
      table: 'credit_orders',
      columns: [
        'id', 'order_number', 'customer_id', 'order_date', 'required_date', 'order_type',
        'subtotal', 'discount_amount', 'tax_amount', 'total_amount', 'advance_paid',
        'balance_due', 'amount_paid', 'status', 'assigned_branch_id', 'priority', 'sort_order',
        'created_by_user_id', 'approved_by_user_id', 'approved_at', 'shipping_address',
        'special_instructions', 'internal_notes', 'created_at', 'updated_at',
        'total_weight_kg', 'requires_vehicle_type', 'delivery_type', 'is_other_sales',
      ],
      note: 'status enum -> varchar in vue (no cast needed); delivery_priority column dropped (vue-incompatible); production_seq/dispatch_pin/delivery_pin/mini_truck_surcharge left at vue defaults',
      transform: (row) => {
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const approvedBy = mapUser(userMap, row.approved_by_user_id, notes)
        if (row.assigned_branch_id != null && !vueBranchIds.has(String(row.assigned_branch_id))) {
          report.warnings.push(`credit_orders #${row.id}: assigned_branch_id ${row.assigned_branch_id} not in vue branches — set NULL`)
          row.assigned_branch_id = null
        }
        return {
          id: row.id, order_number: row.order_number, customer_id: row.customer_id,
          order_date: row.order_date, required_date: row.required_date, order_type: row.order_type,
          subtotal: row.subtotal, discount_amount: row.discount_amount, tax_amount: row.tax_amount,
          total_amount: row.total_amount, advance_paid: row.advance_paid, balance_due: row.balance_due,
          amount_paid: row.amount_paid, status: row.status, assigned_branch_id: row.assigned_branch_id,
          priority: row.priority, sort_order: row.sort_order,
          created_by_user_id: createdBy.value, approved_by_user_id: approvedBy.value,
          approved_at: row.approved_at, shipping_address: row.shipping_address,
          special_instructions: row.special_instructions,
          internal_notes: [row.internal_notes, ...notes].filter(Boolean).join(' | ') || null,
          created_at: row.created_at, updated_at: row.updated_at,
          total_weight_kg: row.total_weight_kg, requires_vehicle_type: row.requires_vehicle_type,
          delivery_type: row.delivery_type, is_other_sales: row.is_other_sales,
        }
      },
    })
    // Safe to attach a child to this order_id only if it was just inserted,
    // or it already existed on both sides with a matching order_number
    // (verified: 38/38 shared credit_orders ids matched — but don't assume
    // that holds for every table; this check is what makes it safe rather
    // than lucky).
    const safeOrderIds = await buildSafeParentIds(legacy, vue, 'credit_orders', insertedOrderIds, ['order_number'])

    // ---- credit_order_items ----------------------------------------------
    await syncTable(legacy, vue, {
      table: 'credit_order_items',
      columns: [
        'id', 'order_id', 'product_id', 'variant_id', 'quantity', 'unit_price',
        'discount_amount', 'tax_amount', 'line_total', 'notes', 'created_at',
        'total_weight_kg', 'commodity_id', 'origin',
      ],
      note: 'origin -> commodity_origin rename; cogs_amount/source_purchase_order_id dropped (vue-incompatible)',
      transform: (row) => {
        if (!safeOrderIds.has(String(row.order_id))) {
          report.warnings.push(`credit_order_items #${row.id}: order_id ${row.order_id} missing in vue — skipped`)
          return null
        }
        let productId = row.product_id
        if (productId != null && !vueProductIds.has(String(productId))) {
          report.warnings.push(`credit_order_items #${row.id}: product_id ${productId} not in vue products — inserted anyway (verify manually)`)
        }
        let variantId = row.variant_id
        if (variantId != null && !vueVariantIds.has(String(variantId))) {
          report.warnings.push(`credit_order_items #${row.id}: variant_id ${variantId} not in vue product_variants — set NULL`)
          variantId = null
        }
        let commodityId = row.commodity_id
        if (commodityId != null && !vueCommodityIds.has(String(commodityId))) {
          report.warnings.push(`credit_order_items #${row.id}: commodity_id ${commodityId} not in vue purchase_commodities — set NULL`)
          commodityId = null
        }
        return {
          id: row.id, order_id: row.order_id, product_id: productId, variant_id: variantId,
          quantity: row.quantity, unit_price: row.unit_price, discount_amount: row.discount_amount,
          tax_amount: row.tax_amount, line_total: row.line_total, notes: row.notes,
          created_at: row.created_at, total_weight_kg: row.total_weight_kg,
          commodity_id: commodityId, commodity_origin: row.origin,
        }
      },
    })

    // ---- credit_order_deliveries ------------------------------------------
    const insertedDeliveryIds = await syncTable(legacy, vue, {
      table: 'credit_order_deliveries',
      columns: [
        'id', 'delivery_number', 'order_id', 'customer_id', 'delivery_date', 'truck_number',
        'driver_name', 'driver_contact', 'total_qty_delivered', 'total_amount_delivered',
        'is_final', 'notes', 'created_by_user_id', 'created_at',
      ],
      optional: ['delivery_slip_number', 'bags_boarded', 'bag_size_kg', 'extra_discount_amount',
        'extra_discount_reason', 'extra_discount_by_user_id', 'extra_discount_at'],
      transform: (row) => {
        if (!safeOrderIds.has(String(row.order_id))) {
          report.warnings.push(`credit_order_deliveries #${row.id}: order_id ${row.order_id} missing in vue — skipped`)
          return null
        }
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const out = {
          ...row,
          created_by_user_id: createdBy.value,
          notes: [row.notes, ...notes].filter(Boolean).join(' | ') || null,
        }
        if ('extra_discount_by_user_id' in row && row.extra_discount_by_user_id != null)
          out.extra_discount_by_user_id = mapUser(userMap, row.extra_discount_by_user_id, []).value
        return out
      },
    })
    const safeDeliveryIds = await buildSafeParentIds(legacy, vue, 'credit_order_deliveries', insertedDeliveryIds, ['delivery_number'])

    // ---- credit_order_delivery_items --------------------------------------
    await syncTable(legacy, vue, {
      table: 'credit_order_delivery_items',
      columns: ['id', 'delivery_id', 'order_item_id', 'product_id', 'variant_id', 'qty_delivered', 'unit_price', 'line_amount'],
      transform: (row) => {
        if (!safeDeliveryIds.has(String(row.delivery_id))) {
          report.warnings.push(`credit_order_delivery_items #${row.id}: delivery_id ${row.delivery_id} missing/unverified in vue — skipped`)
          return null
        }
        return row
      },
    })

    // ---- credit_order_shipping --------------------------------------------
    // Keyed by order_id, NOT id: both apps now write this table, so ids are not comparable.
    // Only orders with no shipping row in vue yet are copied (vue-native dispatches are never overwritten).
    {
      const lc = await presentColumns(legacy, 'credit_order_shipping')
      const vc = await presentColumns(vue, 'credit_order_shipping')
      const cols = ['order_id', 'truck_number', 'driver_name', 'driver_contact', 'shipped_date', 'delivered_date',
        'shipped_by_user_id', 'delivered_by_user_id', 'delivery_notes', 'created_at', 'updated_at',
        'bags_boarded', 'bag_size_kg', 'delivery_slip_number', 'extra_discount_amount', 'extra_discount_reason',
        'extra_discount_by_user_id', 'extra_discount_at'].filter(c => lc.has(c) && vc.has(c))
      const [lRows] = await legacy.query(`SELECT ${cols.join(',')} FROM credit_order_shipping`)
      const [vRows] = await vue.query(`SELECT order_id FROM credit_order_shipping`)
      const have = new Set(vRows.map(r => String(r.order_id)))
      const toInsert = []
      let skipped = 0
      for (const row of lRows) {
        if (have.has(String(row.order_id))) continue
        if (!safeOrderIds.has(String(row.order_id))) { skipped++; continue }
        const out = { ...row }
        for (const k of ['shipped_by_user_id', 'delivered_by_user_id', 'extra_discount_by_user_id'])
          if (k in out && out[k] != null) out[k] = mapUser(userMap, out[k], []).value
        toInsert.push(out)
      }
      report.tables.push({ table: 'credit_order_shipping', missing: toInsert.length + skipped, inserted: toInsert.length, skipped,
        note: 'matched by order_id; vue-native dispatch rows are never touched' })
      if (APPLY && toInsert.length) {
        const outCols = Object.keys(toInsert[0])
        const per = Math.max(1, Math.floor(5000 / outCols.length))
        for (let i = 0; i < toInsert.length; i += per) {
          const batch = toInsert.slice(i, i + per)
          await vue.query(
            `INSERT INTO credit_order_shipping (${outCols.map(c => `\`${c}\``).join(',')}) VALUES ${batch.map(() => `(${outCols.map(() => '?').join(',')})`).join(',')}`,
            batch.flatMap(r => outCols.map(c => r[c] ?? null)))
        }
      }
    }

    // ---- credit_order_workflow --------------------------------------------
    await syncTable(legacy, vue, {
      table: 'credit_order_workflow',
      columns: ['id', 'order_id', 'from_status', 'to_status', 'action', 'performed_by_user_id', 'comments', 'credit_check_amount', 'credit_limit_used_percent', 'performed_at'],
      transform: (row) => {
        if (!safeOrderIds.has(String(row.order_id))) {
          report.warnings.push(`credit_order_workflow #${row.id}: order_id ${row.order_id} missing in vue — skipped`)
          return null
        }
        const notes = []
        const performedBy = mapUser(userMap, row.performed_by_user_id, notes)
        return {
          ...row,
          performed_by_user_id: performedBy.value,
          comments: [row.comments, ...notes].filter(Boolean).join(' | ') || null,
        }
      },
    })

    // ---- journal_entries (before customer_ledger — it references these) ---
    const insertedJournalEntryIds = await syncTable(legacy, vue, {
      table: 'journal_entries',
      columns: ['id', 'uuid', 'transaction_date', 'description', 'related_document_id', 'related_document_type', 'responsible_employee_id', 'created_by_user_id', 'created_at', 'updated_at', 'is_reversed', 'reversed_by_entry_id', 'reverses_entry_id'],
      transform: (row) => {
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        // responsible_employee_id references `employees`, not `users` — left as-is (employees ids verified stable/small table, synced earlier)
        return {
          ...row,
          created_by_user_id: createdBy.value,
          description: [row.description, ...notes].filter(Boolean).join(' | ') || row.description,
        }
      },
    })
    // journal_entries has no single natural-language key that's reliably
    // unique, but (transaction_date, description) is good enough to catch
    // the coincidental-id-reuse case (confirmed: 9/5644 shared ids point to
    // an unrelated entry on each side — this is what excludes those 9).
    const safeJournalEntryIds = await buildSafeParentIds(legacy, vue, 'journal_entries', insertedJournalEntryIds, ['transaction_date', 'description'])

    // ---- chart_of_accounts (master data; auto-id — id-preservation proven
    // unsafe here: 8 collisions found where the same id is a completely
    // different real account in each database) ------------------------------
    const safeAccountIds = await syncTableAutoId(legacy, vue, {
      table: 'chart_of_accounts',
      columns: ['account_number', 'account_type', 'branch_id', 'account_type_group', 'normal_balance', 'status', 'description', 'is_active', 'created_at', 'name'],
      naturalKeyCols: ['name', 'account_number'],
      note: 'never preserves id — matched/inserted by (name, account_number) only',
      transform: (row) => {
        if (row.branch_id != null && !vueBranchIds.has(String(row.branch_id))) {
          report.warnings.push(`chart_of_accounts (legacy source row): branch_id ${row.branch_id} not in vue branches — set NULL`)
          row.branch_id = null
        }
        return row
      },
    })

    // ---- transaction_lines --------------------------------------------------
    await syncTable(legacy, vue, {
      table: 'transaction_lines',
      columns: ['id', 'journal_entry_id', 'account_id', 'debit_amount', 'credit_amount', 'description'],
      transform: (row) => {
        if (!safeJournalEntryIds.has(String(row.journal_entry_id))) {
          report.warnings.push(`transaction_lines #${row.id}: journal_entry_id ${row.journal_entry_id} missing/unverified in vue — skipped`)
          return null
        }
        if (!safeAccountIds.has(String(row.account_id))) {
          report.warnings.push(`transaction_lines #${row.id}: account_id ${row.account_id} not in vue chart_of_accounts — skipped`)
          return null
        }
        return { ...row, account_id: safeAccountIds.resolve(row.account_id) }
      },
    })

    // ---- customer_ledger ----------------------------------------------------
    // journal_entry_id is nullable here — an unverified/collided reference
    // just loses that one cross-link (noted in the description), the ledger
    // row itself (amount, customer, date) is still correct and inserted.
    await syncTable(legacy, vue, {
      table: 'customer_ledger',
      columns: ['id', 'customer_id', 'transaction_date', 'transaction_type', 'reference_type', 'reference_id', 'invoice_number', 'description', 'debit_amount', 'credit_amount', 'balance_after', 'created_by_user_id', 'journal_entry_id', 'created_at'],
      note: 'transaction_type enum -> varchar in vue (no cast needed)',
      transform: (row) => {
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        let journalEntryId = row.journal_entry_id
        if (journalEntryId != null && !safeJournalEntryIds.has(String(journalEntryId))) {
          report.warnings.push(`customer_ledger #${row.id}: journal_entry_id ${journalEntryId} missing/unverified in vue — set NULL (row still inserted)`)
          journalEntryId = null
        }
        return {
          ...row,
          created_by_user_id: createdBy.value,
          journal_entry_id: journalEntryId,
          description: [row.description, ...notes].filter(Boolean).join(' | ') || row.description,
        }
      },
    })

    // ==== purchases & expenses ==============================================
    // Same additive/safe-id-set pattern as above. Verified separately: EVERY
    // shared id across suppliers/purchase_orders_adnan/purchase_payments_adnan
    // /expense_vouchers/purchase_commodities/purchase_commodity_origins/
    // purchase_adjustment_notes matched its natural key with zero mismatches
    // (unlike credit_orders/journal_entries above) — this subsystem was
    // rolled out to both databases at the same time, so ids never drifted
    // the way older tables did. Still routed through buildSafeParentIds
    // rather than assumed, so a future drift would be caught the same way.

    // ---- suppliers (master data, needed by purchase_orders_adnan) --------
    const insertedSupplierIds = await syncTable(legacy, vue, {
      table: 'suppliers',
      columns: ['id', 'uuid', 'supplier_code', 'company_name', 'contact_person', 'email', 'phone', 'mobile', 'address', 'city', 'country', 'tax_id', 'payment_terms', 'credit_limit', 'opening_balance', 'current_balance', 'supplier_type', 'status', 'notes', 'created_by_user_id', 'created_at', 'updated_at', 'business_partner_id'],
      transform: (row) => {
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        return { ...row, created_by_user_id: createdBy.value, notes: [row.notes, ...notes].filter(Boolean).join(' | ') || null }
      },
    })
    const safeSupplierIds = await buildSafeParentIds(legacy, vue, 'suppliers', insertedSupplierIds, ['company_name', 'phone'])

    // ---- purchase_commodities (master data) --------------------------------
    const insertedCommodityIds = await syncTable(legacy, vue, {
      table: 'purchase_commodities',
      columns: ['id', 'name', 'unit', 'inventory_account_id', 'status', 'created_at', 'is_sellable'],
      note: 'notes column dropped (not in vue); sort_order/updated_at left at vue defaults; status enum -> varchar (no cast needed)',
      transform: (row) => {
        let acct = row.inventory_account_id
        if (acct != null) {
          if (safeAccountIds.has(acct)) acct = safeAccountIds.resolve(acct)
          else {
            report.warnings.push(`purchase_commodities #${row.id}: inventory_account_id ${acct} not in vue chart_of_accounts — set NULL`)
            acct = null
          }
        }
        return { ...row, inventory_account_id: acct }
      },
    })
    const safeCommodityIds = await buildSafeParentIds(legacy, vue, 'purchase_commodities', insertedCommodityIds, ['name'])

    // ---- bank_accounts (master data; NOT chart_of_accounts — payment tables'
    // bank_account_id has an enforced FK straight to this table. Auto-id for
    // the same reason as chart_of_accounts: id-preservation proven unsafe —
    // found 8 direct collisions, then a 9th one level deeper where fixing
    // those via auto-increment reassigned a vue id that collided with
    // legacy's own next id. account_number is UNIQUE-keyed, the natural key.)
    const safeBankAccountIds = await syncTableAutoId(legacy, vue, {
      table: 'bank_accounts',
      columns: ['chart_of_account_id', 'uuid', 'bank_name', 'branch_name', 'account_name', 'account_number', 'account_type', 'address', 'initial_balance', 'current_balance', 'status', 'created_at', 'updated_at'],
      naturalKeyCols: ['account_number'],
      note: 'never preserves id — matched/inserted by account_number only; opening_balance/legacy_tx_account_id (vue-only columns) left at defaults',
      transform: (row) => {
        if (row.chart_of_account_id != null) {
          if (safeAccountIds.has(row.chart_of_account_id)) row.chart_of_account_id = safeAccountIds.resolve(row.chart_of_account_id)
          else {
            report.warnings.push(`bank_accounts: chart_of_account_id ${row.chart_of_account_id} not in vue chart_of_accounts — set NULL`)
            row.chart_of_account_id = null
          }
        }
        return row
      },
    })
    const vuePettyCashIds = await refSet(vue, 'branch_petty_cash_accounts') // verified 3/3 identical, plain existence check is fine here

    // ---- purchase_commodity_origins ----------------------------------------
    await syncTable(legacy, vue, {
      table: 'purchase_commodity_origins',
      columns: ['id', 'commodity_id', 'origin_name'],
      note: 'status/created_at columns dropped (not in vue); sort_order left at vue default',
      transform: (row) => {
        if (!safeCommodityIds.has(String(row.commodity_id))) {
          report.warnings.push(`purchase_commodity_origins #${row.id}: commodity_id ${row.commodity_id} missing/unverified in vue — skipped`)
          return null
        }
        return row
      },
    })

    // ---- purchase_orders_adnan ----------------------------------------------
    const insertedPoIds = await syncTable(legacy, vue, {
      table: 'purchase_orders_adnan',
      columns: [
        'id', 'uuid', 'po_number', 'po_date', 'supplier_id', 'supplier_name', 'branch_id',
        'wheat_origin', 'quantity_kg', 'unit_price_per_kg', 'total_order_value', 'expected_delivery_date',
        'total_received_qty', 'total_received_value', 'total_paid', 'balance_payable', 'po_status',
        'delivery_status', 'is_delivery_locked', 'delivery_lock_reason', 'delivery_locked_by_user_id',
        'delivery_locked_at', 'payment_status', 'remarks', 'created_by_user_id', 'created_at', 'updated_at',
        'total_adjustment_amount', 'final_delivery_marked', 'commodity_id',
      ],
      note: 'unit column dropped (not in vue); po_payment_terms left at vue default (Credit 30); qty_yet_to_receive is a generated column, not inserted',
      transform: (row) => {
        if (!safeSupplierIds.has(String(row.supplier_id))) {
          report.warnings.push(`purchase_orders_adnan #${row.id}: supplier_id ${row.supplier_id} missing/unverified in vue — skipped`)
          return null
        }
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const lockedBy = mapUser(userMap, row.delivery_locked_by_user_id, notes)
        if (row.branch_id != null && !vueBranchIds.has(String(row.branch_id))) {
          report.warnings.push(`purchase_orders_adnan #${row.id}: branch_id ${row.branch_id} not in vue branches — set NULL`)
          row.branch_id = null
        }
        let commodityId = row.commodity_id
        if (commodityId != null) {
          if (safeCommodityIds.has(commodityId)) commodityId = safeCommodityIds.resolve(commodityId)
          else {
            report.warnings.push(`purchase_orders_adnan #${row.id}: commodity_id ${commodityId} missing/unverified in vue — set NULL`)
            commodityId = null
          }
        }
        return {
          ...row,
          supplier_id: safeSupplierIds.resolve(row.supplier_id),
          created_by_user_id: createdBy.value,
          delivery_locked_by_user_id: lockedBy.value,
          commodity_id: commodityId,
          remarks: [row.remarks, ...notes].filter(Boolean).join(' | ') || null,
        }
      },
    })
    const safePoIds = await buildSafeParentIds(legacy, vue, 'purchase_orders_adnan', insertedPoIds, ['po_number'])

    // ---- purchase_payments_adnan --------------------------------------------
    await syncTable(legacy, vue, {
      table: 'purchase_payments_adnan',
      columns: [
        'id', 'uuid', 'payment_voucher_number', 'payment_date', 'purchase_order_id', 'po_number',
        'supplier_id', 'supplier_name', 'amount_paid', 'payment_method', 'bank_account_id', 'bank_name',
        'handled_by_employee', 'reference_number', 'payment_type', 'remarks', 'journal_entry_id',
        'is_posted', 'created_by_user_id', 'approved_by_user_id', 'approved_at', 'created_at', 'updated_at',
      ],
      transform: (row) => {
        if (!safePoIds.has(String(row.purchase_order_id))) {
          report.warnings.push(`purchase_payments_adnan #${row.id}: purchase_order_id ${row.purchase_order_id} missing/unverified in vue — skipped`)
          return null
        }
        if (!safeSupplierIds.has(String(row.supplier_id))) {
          report.warnings.push(`purchase_payments_adnan #${row.id}: supplier_id ${row.supplier_id} missing/unverified in vue — skipped`)
          return null
        }
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const approvedBy = mapUser(userMap, row.approved_by_user_id, notes)
        let bankAccountId = row.bank_account_id
        if (bankAccountId != null) {
          if (safeBankAccountIds.has(bankAccountId)) bankAccountId = safeBankAccountIds.resolve(bankAccountId)
          else {
            report.warnings.push(`purchase_payments_adnan #${row.id}: bank_account_id ${bankAccountId} not in vue bank_accounts — set NULL`)
            bankAccountId = null
          }
        }
        let journalEntryId = row.journal_entry_id
        if (journalEntryId != null && !safeJournalEntryIds.has(String(journalEntryId))) {
          report.warnings.push(`purchase_payments_adnan #${row.id}: journal_entry_id ${journalEntryId} missing/unverified in vue — set NULL`)
          journalEntryId = null
        }
        return {
          ...row,
          purchase_order_id: safePoIds.resolve(row.purchase_order_id),
          supplier_id: safeSupplierIds.resolve(row.supplier_id),
          created_by_user_id: createdBy.value,
          approved_by_user_id: approvedBy.value,
          bank_account_id: bankAccountId,
          journal_entry_id: journalEntryId,
          remarks: [row.remarks, ...notes].filter(Boolean).join(' | ') || null,
        }
      },
    })

    // ---- purchase_adjustment_notes ------------------------------------------
    await syncTable(legacy, vue, {
      table: 'purchase_adjustment_notes',
      columns: [
        'id', 'note_number', 'note_type', 'reason_type', 'purchase_order_id', 'po_number', 'supplier_id',
        'supplier_name', 'quantity_kg', 'unit_price_per_kg', 'amount', 'description', 'status',
        'created_by_user_id', 'approved_by_user_id', 'approved_at', 'posted_at', 'created_at', 'updated_at',
      ],
      transform: (row) => {
        if (!safePoIds.has(String(row.purchase_order_id))) {
          report.warnings.push(`purchase_adjustment_notes #${row.id}: purchase_order_id ${row.purchase_order_id} missing/unverified in vue — skipped`)
          return null
        }
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const approvedBy = mapUser(userMap, row.approved_by_user_id, notes)
        return {
          ...row,
          purchase_order_id: safePoIds.resolve(row.purchase_order_id),
          supplier_id: row.supplier_id != null ? safeSupplierIds.resolve(row.supplier_id) : null,
          created_by_user_id: createdBy.value,
          approved_by_user_id: approvedBy.value,
          description: [row.description, ...notes].filter(Boolean).join(' | ') || row.description,
        }
      },
    })

    // ---- expense_vouchers ----------------------------------------------------
    const vueCategoryIds = await refSet(vue, 'expense_categories')
    const vueSubcategoryIds = await refSet(vue, 'expense_subcategories')
    const vueEmployeeIds = await refSet(vue, 'employees')
    await syncTable(legacy, vue, {
      table: 'expense_vouchers',
      columns: [
        'id', 'voucher_number', 'expense_date', 'category_id', 'subcategory_id', 'handled_by_person',
        'employee_id', 'unit_quantity', 'per_unit_cost', 'total_amount', 'remarks', 'payment_method',
        'bank_account_id', 'cash_account_id', 'payment_account_name', 'payment_reference', 'journal_entry_id',
        'expense_account_id', 'branch_id', 'status', 'approved_by_user_id', 'approved_at',
        'telegram_notified', 'rejection_reason', 'created_by_user_id', 'created_at', 'updated_at',
      ],
      transform: (row) => {
        if (!vueCategoryIds.has(String(row.category_id))) {
          report.warnings.push(`expense_vouchers #${row.id}: category_id ${row.category_id} not in vue expense_categories — skipped`)
          return null
        }
        if (!vueSubcategoryIds.has(String(row.subcategory_id))) {
          report.warnings.push(`expense_vouchers #${row.id}: subcategory_id ${row.subcategory_id} not in vue expense_subcategories — skipped`)
          return null
        }
        const notes = []
        const createdBy = mapUser(userMap, row.created_by_user_id, notes)
        const approvedBy = mapUser(userMap, row.approved_by_user_id, notes)
        if (row.employee_id != null && !vueEmployeeIds.has(String(row.employee_id))) {
          report.warnings.push(`expense_vouchers #${row.id}: employee_id ${row.employee_id} not in vue employees — set NULL`)
          row.employee_id = null
        }
        // Real FK targets (verified via SHOW CREATE TABLE): bank_account_id ->
        // bank_accounts, cash_account_id -> branch_petty_cash_accounts,
        // expense_account_id -> chart_of_accounts (soft, unenforced, but
        // checked anyway for cleanliness).
        if (row.bank_account_id != null) {
          if (safeBankAccountIds.has(row.bank_account_id)) row.bank_account_id = safeBankAccountIds.resolve(row.bank_account_id)
          else {
            report.warnings.push(`expense_vouchers #${row.id}: bank_account_id ${row.bank_account_id} not in vue bank_accounts — set NULL`)
            row.bank_account_id = null
          }
        }
        if (row.cash_account_id != null && !vuePettyCashIds.has(String(row.cash_account_id))) {
          report.warnings.push(`expense_vouchers #${row.id}: cash_account_id ${row.cash_account_id} not in vue branch_petty_cash_accounts — set NULL`)
          row.cash_account_id = null
        }
        if (row.expense_account_id != null) {
          if (safeAccountIds.has(row.expense_account_id)) row.expense_account_id = safeAccountIds.resolve(row.expense_account_id)
          else {
            report.warnings.push(`expense_vouchers #${row.id}: expense_account_id ${row.expense_account_id} not in vue chart_of_accounts — set NULL`)
            row.expense_account_id = null
          }
        }
        if (row.branch_id != null && !vueBranchIds.has(String(row.branch_id))) {
          report.warnings.push(`expense_vouchers #${row.id}: branch_id ${row.branch_id} not in vue branches — set NULL`)
          row.branch_id = null
        }
        let journalEntryId = row.journal_entry_id
        if (journalEntryId != null && !safeJournalEntryIds.has(String(journalEntryId))) {
          report.warnings.push(`expense_vouchers #${row.id}: journal_entry_id ${journalEntryId} missing/unverified in vue — set NULL`)
          journalEntryId = null
        }
        return {
          ...row,
          created_by_user_id: createdBy.value,
          approved_by_user_id: approvedBy.value,
          journal_entry_id: journalEntryId,
          remarks: [row.remarks, ...notes].filter(Boolean).join(' | ') || row.remarks,
        }
      },
    })

    if (APPLY) await vue.commit()
  } catch (err) {
    if (APPLY) await vue.rollback()
    throw err
  } finally {
    await legacy.end()
    await vue.end()
  }

  // ---- report --------------------------------------------------------------
  console.log('Table'.padEnd(30), 'Missing'.padEnd(10), 'Inserted'.padEnd(10), 'Skipped')
  for (const t of report.tables) {
    console.log(t.table.padEnd(30), String(t.missing).padEnd(10), String(t.inserted).padEnd(10), String(t.skipped))
    if (t.note) console.log('  note:', t.note)
  }
  if (report.warnings.length) {
    console.log(`\n${report.warnings.length} warning(s):`)
    for (const w of report.warnings.slice(0, 50)) console.log(' -', w)
    if (report.warnings.length > 50) console.log(`  ...and ${report.warnings.length - 50} more`)
  }
  if (!APPLY) console.log('\nDry run only — no writes made. Re-run with --apply to write.')
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
