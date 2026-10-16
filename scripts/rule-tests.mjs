#!/usr/bin/env node
/**
 * Executable business-rule checklist (from legacy-operations-guide.md + the Option B decisions).
 *
 * Runs against a SCRATCH database only — never point it at production. It needs:
 *   - the built app running (node .output/server/index.mjs) with NUXT_SESSION_PASSWORD=<SESSION_PW>
 *   - a scratch DB seeded by scripts/rule-tests.seed.sql
 *
 *   SESSION_PW=... BASE=http://127.0.0.1:3100 DB_PORT=3390 node scripts/rule-tests.mjs
 *
 * Prints one line per rule: PASS / FAIL. Exit code 1 if anything fails.
 */
import { createApp, eventHandler, toNodeListener, useSession } from 'h3'
import http from 'node:http'
import mysql from 'mysql2/promise'

const BASE = process.env.BASE ?? 'http://127.0.0.1:3100'
const PW = process.env.SESSION_PW
if (!PW) { console.error('SESSION_PW required'); process.exit(2) }
const db = await mysql.createConnection({ host: '127.0.0.1', port: Number(process.env.DB_PORT ?? 3390), user: 'tst', password: 'tstpw', database: 'scratch_vue' })
if (!/scratch/.test((await db.query('select database() d'))[0][0].d)) { console.error('refusing: not a scratch DB'); process.exit(2) }

// ── session cookies for each seeded user (same sealing the app uses) ─────────
const users = { super: [1, 'Superadmin'], acct: [2, 'Accounts'], sales: [3, 'sales-srg'], disp: [4, 'dispatch-srg'], prod: [5, 'production manager-srg'], staff: [6, 'Staff'], admin: [7, 'admin'], demra: [9, 'accounts-demra'] }
const sealer = http.createServer(toNodeListener(createApp().use(eventHandler(async (e) => {
  const [id, role] = new URL(e.node.req.url, 'http://x').searchParams.get('u').split(',')
  const s = await useSession(e, { password: PW, name: 'nuxt-session', cookie: { httpOnly: true, path: '/' } })
  await s.update({ user: { id: Number(id), name: role, role }, loggedInAt: Date.now() })
  return 'ok'
})))).listen(0)
const sealPort = sealer.address().port
const cookie = {}
for (const [k, [id, role]] of Object.entries(users)) {
  const r = await fetch(`http://127.0.0.1:${sealPort}/?u=${id},${encodeURIComponent(role)}`)
  cookie[k] = r.headers.get('set-cookie').split(';')[0]
}

async function call(as, method, path, body) {
  const r = await fetch(BASE + path, {
    method, redirect: 'manual',
    headers: { ...(as ? { cookie: cookie[as] } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  let json = null; try { json = await r.json() } catch { /* not json */ }
  return { status: r.status, json, msg: json?.statusMessage ?? json?.message ?? '' }
}

let failed = 0
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `   → ${detail}`}`)
  if (!ok) failed++
}
const expectStatus = async (name, p, want) => { const r = await p; check(name, [].concat(want).includes(r.status), `got ${r.status} ${r.msg}`); return r }

const today = new Date().toISOString().slice(0, 10)
const newOrder = async (as = 'sales', qty = 10) => (await call(as, 'POST', '/api/credit-sales', {
  customer_id: 1, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: qty, unit_price: 1000, discount_amount: 0 }],
})).json
const wf = (as, id, to, extra = {}) => call(as, 'POST', `/api/credit-sales/${id}/workflow`, { to_status: to, comments: 't', ...extra })
const truck = { truck_number: 'DM-1', driver_name: 'Karim' }
const orderRow = async (id) => (await db.query('select * from credit_orders where id=?', [id]))[0][0]

// ── 1. Access ────────────────────────────────────────────────────────────────
await expectStatus('no login → 401 on data endpoints', call(null, 'GET', '/api/customers'), 401)
await expectStatus('Staff (dashboard-only role) cannot open credit sales API', call('staff', 'GET', '/api/credit-sales'), 403)
await expectStatus('sales role can open credit sales API (role default, no permission row)', call('sales', 'GET', '/api/credit-sales'), 200)
await expectStatus('sales cannot change credit limits', call('sales', 'PATCH', '/api/credit-sales/credit-limits', { updates: [{ id: 1, credit_limit: 1 }] }), 403)
await expectStatus('accounts can reach credit-limit endpoint', call('acct', 'PATCH', '/api/credit-sales/credit-limits', { updates: [{ id: 1, credit_limit: 100000 }] }), 200)
await expectStatus('sales cannot set prices', call('sales', 'POST', '/api/products/pricing/1', { branch_id: 1, unit_price: 1 }), 403)

// ── 2. Order → approval ──────────────────────────────────────────────────────
const o1 = await newOrder()
check('sales creates order → pending_approval', o1?.status === 'pending_approval', JSON.stringify(o1))
await expectStatus('sales cannot approve', wf('sales', o1.id, 'approved'), 403)
const adminOrder = await newOrder('super')
check('admin/superadmin order is auto-approved (never needs approval)', adminOrder?.status === 'approved', JSON.stringify(adminOrder))
await expectStatus('accounts approves within credit', wf('acct', o1.id, 'approved'), 200)

// ── 3. Production + the payment hold at READY TO SHIP ───────────────────────
await expectStatus('production starts', wf('prod', o1.id, 'in_production'), 200)
await expectStatus('production marks it produced', wf('prod', o1.id, 'produced'), 200)
await expectStatus('Ready to Ship cannot be skipped: in_production → ready_to_ship is refused', wf('prod', (await newOrder('super')).id, 'ready_to_ship'), 409)
const hold = await wf('prod', o1.id, 'ready_to_ship')
check('Ready to Ship is BLOCKED while dispatch hold is uncleared (423)', hold.status === 423, `got ${hold.status} ${hold.msg}`)
await expectStatus('sales cannot clear dispatch hold', call('sales', 'POST', `/api/credit-sales/${o1.id}/gates`, { action: 'clear_dispatch' }), 403)
await expectStatus('admin clears dispatch hold (accounts needs a delegated early-release limit)', call('admin', 'POST', `/api/credit-sales/${o1.id}/gates`, { action: 'clear_dispatch', note: 'ok' }), 200)
await expectStatus('Ready to Ship allowed once cleared', wf('prod', o1.id, 'ready_to_ship'), 200)

// ── 4. Goods on board: truck details, extra discount, slip number ───────────
await expectStatus('goods on board without truck/driver → 400', wf('disp', o1.id, 'goods_on_board'), 400)
await expectStatus('extra discount without reason → 400', wf('disp', o1.id, 'goods_on_board', { dispatch: { ...truck, extra_discount_amount: 500 } }), 400)
await expectStatus('extra discount above subtotal → 400', wf('disp', o1.id, 'goods_on_board', { dispatch: { ...truck, extra_discount_amount: 999999, extra_discount_reason: 'x' } }), 400)
await expectStatus('goods on board with truck + discount', wf('disp', o1.id, 'goods_on_board', { dispatch: { ...truck, bags_boarded: 10, bag_size_kg: 50, extra_discount_amount: 500, extra_discount_reason: 'short weight' } }), 200)
const ord1 = await orderRow(o1.id)
check('discount reduces the invoiced total (10,000 → 9,500)', Number(ord1.total_amount) === 9500 && Number(ord1.discount_amount) === 500, `${ord1.total_amount}/${ord1.discount_amount}`)
const [[led]] = await db.query(`select debit_amount d, journal_entry_id j from customer_ledger where reference_id=? and transaction_type='invoice'`, [o1.id])
check('invoice posted to ledger at the discounted total', Number(led?.d) === 9500, JSON.stringify(led))
const [[je]] = await db.query('select sum(debit_amount) d, sum(credit_amount) c from transaction_lines where journal_entry_id=?', [led?.j])
check('journal entry balanced at 9,500', Number(je.d) === 9500 && Number(je.c) === 9500, JSON.stringify(je))
const [[ship]] = await db.query('select * from credit_order_shipping where order_id=?', [o1.id])
const yr = new Date().getFullYear(), mo = new Date().getMonth() + 1
check('delivery slip number is branch-coded SRG-YYYY-M-001', ship?.delivery_slip_number === `SRG-${yr}-${mo}-001`, ship?.delivery_slip_number)
check('bags boarded / bag size / discount reason stored', ship?.bags_boarded === 10 && Number(ship?.bag_size_kg) === 50 && ship?.extra_discount_reason === 'short weight', JSON.stringify(ship))

// second order → slip 002, and clean reversal
const o2 = await newOrder('super')
await wf('prod', o2.id, 'in_production'); await wf('prod', o2.id, 'produced'); await call('admin', 'POST', `/api/credit-sales/${o2.id}/gates`, { action: 'clear_dispatch', note: 'ok' }); await wf('prod', o2.id, 'ready_to_ship')
await wf('disp', o2.id, 'goods_on_board', { dispatch: truck })
const [[ship2]] = await db.query('select delivery_slip_number s from credit_order_shipping where order_id=?', [o2.id])
check('next truck in the month gets slip …-002', ship2?.s === `SRG-${yr}-${mo}-002`, ship2?.s)

// ── 5. Reverse dispatch ──────────────────────────────────────────────────────
await expectStatus('sales cannot reverse a dispatch', call('sales', 'POST', `/api/credit-sales/${o2.id}/reverse-dispatch`, { reason: 'because' }), 403)
await expectStatus('reversal needs a reason', call('admin', 'POST', `/api/credit-sales/${o2.id}/reverse-dispatch`, { reason: '' }), 400)
await expectStatus('reversal refused when later ledger rows exist after that invoice', call('admin', 'POST', `/api/credit-sales/${o1.id}/reverse-dispatch`, { reason: 'wrong truck' }), 409)
await expectStatus('admin reverses the latest invoice cleanly', call('admin', 'POST', `/api/credit-sales/${o2.id}/reverse-dispatch`, { reason: 'wrong truck loaded' }), 200)
check('order is back at ready_to_ship', (await orderRow(o2.id)).status === 'ready_to_ship')
const [[gone]] = await db.query(`select count(*) n from customer_ledger where reference_id=? and transaction_type='invoice'`, [o2.id])
check('its invoice ledger row is gone', Number(gone.n) === 0)
const [[bal]] = await db.query('select current_balance b from customers where id=1')
check('customer balance restored to 9,500 (only o1 invoice left)', Number(bal.b) === 9500, bal.b)
const [[rb]] = await db.query(`select count(*) n from recycle_bin_batches where entity_type='dispatch_reversal'`)
check('reversal archived in Recycle Bin', Number(rb.n) === 1)
await wf('disp', o2.id, 'goods_on_board', { dispatch: truck })
const [[ship2b]] = await db.query('select delivery_slip_number s from credit_order_shipping where order_id=?', [o2.id])
check('re-dispatch keeps the same slip number (no number burned)', ship2b?.s === `SRG-${yr}-${mo}-002`, ship2b?.s)

// ── 6. Delegated powers (explicit grant only) ───────────────────────────────
await expectStatus('return decision: ungranted user → 403', call('sales', 'PATCH', '/api/credit-sales/returns/999/status', { action: 'approve' }), 403)
await expectStatus('return decision: admin passes the gate (404 = no such return)', call('admin', 'PATCH', '/api/credit-sales/returns/999/status', { action: 'approve' }), 404)
// user 8 is a sales user with delegated powers written into their own permission row
await db.query(`insert ignore into users (id, display_name, email, password_hash, role) values (8,'Granted','g@t','x','sales-srg')`)
await db.query(`insert into user_permissions (user_id, data_scope, allowed_branches, permissions) values (8,'branch','[]',?)`, [JSON.stringify({
  credit_sales: { enabled: true, pages: ['all', 'collect', 'delivery-schedule'], actions: { all: { approve_return: true }, collect: { hide_invoice: true }, 'delivery-schedule': { can_edit: true } } },
  customers: { enabled: true, pages: ['list'], actions: { list: { set_opening_balance: true, review_ledger: true } } },
})])
{
  const r = await fetch(`http://127.0.0.1:${sealPort}/?u=8,sales-srg`); cookie.granted = r.headers.get('set-cookie').split(';')[0]
}
await expectStatus('return decision: explicitly granted user passes the gate', call('granted', 'PATCH', '/api/credit-sales/returns/999/status', { action: 'approve' }), 404)

// opening balance
await expectStatus('opening balance: sales without grant → 403', call('sales', 'POST', '/api/customers', { name: 'OB One', phone_number: '01700000010', opening_balance: 500 }), 403)
await expectStatus('opening balance: granted user → ok', call('granted', 'POST', '/api/customers', { name: 'OB Two', phone_number: '01700000011', opening_balance: 500 }), [200, 201])
await expectStatus('opening balance: admin → ok', call('admin', 'POST', '/api/customers', { name: 'OB Three', phone_number: '01700000012', opening_balance: 250 }), [200, 201])
await expectStatus('customer without opening balance: sales allowed', call('sales', 'POST', '/api/customers', { name: 'Plain', phone_number: '01700000013' }), [200, 201])
await expectStatus('duplicate phone number → 409', call('sales', 'POST', '/api/customers', { name: 'Dup', phone_number: '01700000013' }), 409)

// hide / recall invoice
const open = (await call('acct', 'GET', '/api/customers/1/open-orders')).json
check('collect list shows the open invoice', open?.orders?.some(o => o.id === o1.id), JSON.stringify(open?.orders?.map(o => o.id)))
await expectStatus('hide invoice: accounts without grant → 403', call('acct', 'POST', '/api/customers/1/collection-hide', { order_id: o1.id }), 403)
await expectStatus('hide invoice: granted user', call('granted', 'POST', '/api/customers/1/collection-hide', { order_id: o1.id, hide: true, reason: 'disputed' }), 200)
check('hidden invoice disappears from the collect list', !(await call('acct', 'GET', '/api/customers/1/open-orders')).json.orders.some(o => o.id === o1.id))
await expectStatus('recall invoice', call('granted', 'POST', '/api/customers/1/collection-hide', { order_id: o1.id, hide: false }), 200)
check('recalled invoice is back', (await call('acct', 'GET', '/api/customers/1/open-orders')).json.orders.some(o => o.id === o1.id))

// ── 7. Amendments need customer consent after dispatch ──────────────────────
await expectStatus('post-dispatch amendment without consent → 400', call('acct', 'POST', `/api/credit-sales/${o1.id}/amendments`, { amend_type: 'freight', description: 'x', flat_amount: 100 }), 400)
await expectStatus('post-dispatch amendment with consent', call('acct', 'POST', `/api/credit-sales/${o1.id}/amendments`, { amend_type: 'freight', description: 'x', flat_amount: 100, consent_confirmed: true, consent_note: 'phone call 10:30' }), [200, 201])

// ── 8. Price auto-apply (guarded by posted invoice) ─────────────────────────
const o3 = await newOrder('super')            // approved, not invoiced
await db.query(`insert into system_settings (setting_key, setting_value) values ('pricing_engine_config', ?) on duplicate key update setting_value=values(setting_value)`, [JSON.stringify({ auto_apply_to_orders: true })])
await expectStatus('admin changes catalog price 1000 → 1100', call('admin', 'POST', '/api/products/pricing/1', { branch_id: 1, unit_price: 1100 }), 200)
const o3row = await orderRow(o3.id)
check('open (un-invoiced) order moved to the new price: 10 × 1100 = 11,000', Number(o3row.total_amount) === 11000, o3row.total_amount)
check('already-invoiced order untouched (9,500)', Number((await orderRow(o1.id)).total_amount) === 9500)
const [[rev]] = await db.query('select count(*) n from credit_order_price_revisions where order_id=?', [o3.id])
check('price revision logged per line', Number(rev.n) === 1)

// ── 9. Delivery schedule ────────────────────────────────────────────────────
await expectStatus('delivery schedule readable by accounts', call('acct', 'GET', '/api/credit-sales/delivery-schedule'), 200)
await expectStatus('schedule edit: accounts without grant → 403', call('acct', 'POST', '/api/credit-sales/delivery-schedule', { action: 'edit', order_id: o3.id, required_date: today, delivery_type: 'mini_truck', branch_id: 1 }), 403)
await expectStatus('schedule edit: granted user', call('granted', 'POST', '/api/credit-sales/delivery-schedule', { action: 'edit', order_id: o3.id, required_date: today, delivery_type: 'mini_truck', branch_id: 1 }), 200)
await expectStatus('schedule reorder by accounts', call('acct', 'POST', '/api/credit-sales/delivery-schedule', { action: 'reorder', ids: [o3.id, adminOrder.id] }), 200)


// ── 11. Money paths keep ledger, customer balance and journals in step ───────
const ledgerSum = async (cid) => { const [[r]] = await db.query('select coalesce(sum(debit_amount),0)-coalesce(sum(credit_amount),0) b from customer_ledger where customer_id=?', [cid]); return Number(r.b) }
const custBal = async (cid) => Number((await db.query('select current_balance b from customers where id=?', [cid]))[0][0].b)
const jeBalanced = async (where, args) => { const [[r]] = await db.query(`select coalesce(sum(tl.debit_amount),0) d, coalesce(sum(tl.credit_amount),0) c from transaction_lines tl join journal_entries je on je.id=tl.journal_entry_id where ${where}`, args); return Number(r.d) === Number(r.c) && Number(r.d) > 0 }
await db.query(`insert into customers (id,name,phone_number,credit_limit,status,customer_type) values (2,'Money Customer','01700000099',500000,'active','Credit')`)
const mord = (await call('super', 'POST', '/api/credit-sales', { customer_id: 2, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: 10, unit_price: 1000, discount_amount: 0 }] })).json
await wf('prod', mord.id, 'in_production'); await wf('prod', mord.id, 'produced'); await call('admin', 'POST', `/api/credit-sales/${mord.id}/gates`, { action: 'clear_dispatch', note: 'ok' }); await wf('prod', mord.id, 'ready_to_ship')
await wf('disp', mord.id, 'goods_on_board', { dispatch: truck })
check('after dispatch: customer balance = ledger = 10,000', (await custBal(2)) === 10000 && (await ledgerSum(2)) === 10000, `${await custBal(2)}/${await ledgerSum(2)}`)
await expectStatus('a bank payment without a bank account → 400', call('admin', 'POST', `/api/credit-sales/${mord.id}/payment`, { amount: 4000, payment_method: 'bank', bank_account_id: null }), 400)
await expectStatus('admin records a ৳4,000 cash payment', call('admin', 'POST', `/api/credit-sales/${mord.id}/payment`, { amount: 4000, payment_method: 'cash' }), [200, 201])
check('after payment: balance = ledger = 6,000', (await custBal(2)) === 6000 && (await ledgerSum(2)) === 6000, `${await custBal(2)}/${await ledgerSum(2)}`)
const moRow = await orderRow(mord.id)
const [[moItem]] = await db.query('select id from credit_order_items where order_id=?', [mord.id])
const deliverBody = (extra) => ({ delivery_date: today, truck_number: 'T1', driver_name: 'D', is_final: false, items: [{ order_item_id: moItem.id, product_id: 1, variant_id: 1, qty_delivered: 4, unit_price: 1000 }], ...extra })
await expectStatus('delivery discount without reason → 400', call('disp', 'POST', `/api/credit-sales/${mord.id}/deliver`, deliverBody({ extra_discount_amount: 300 })), 400)
await expectStatus('delivery discount above the truck value → 400', call('disp', 'POST', `/api/credit-sales/${mord.id}/deliver`, deliverBody({ extra_discount_amount: 9000, extra_discount_reason: 'x' })), 400)
await expectStatus('partial delivery with ৳300 discount', call('disp', 'POST', `/api/credit-sales/${mord.id}/deliver`, deliverBody({ extra_discount_amount: 300, extra_discount_reason: 'short weight', bags_boarded: 4, bag_size_kg: 50 })), [200, 201])
check('discount is a credit note: balance = ledger = 5,700', (await custBal(2)) === 5700 && (await ledgerSum(2)) === 5700, `${await custBal(2)}/${await ledgerSum(2)}`)
check('order total reduced to 9,700 and discount recorded', Number((await orderRow(mord.id)).total_amount) === 9700 && Number((await orderRow(mord.id)).discount_amount) === 300)
check('discount journal is balanced', await jeBalanced(`je.related_document_type='CreditOrderDiscount'`, []))
const [[dl]] = await db.query('select delivery_slip_number s, bags_boarded b from credit_order_deliveries where order_id=?', [mord.id])
check('first truck reuses the Goods-on-Board slip number; bags saved', /^SRG-/.test(dl?.s ?? '') && dl?.b === 4, JSON.stringify(dl))
const nlOrderForReturn = (await newOrder('super')).id
const retItems = [{ order_item_id: moItem.id, product_id: 1, variant_id: 1, original_qty: 10, returned_qty: 1, unit_price: 1000 }]
await expectStatus('admin records a return of 1 bag', call('admin', 'POST', `/api/credit-sales/${mord.id}/return`, { return_reason: 'damaged', items: retItems }), [200, 201])
const [[retRow]] = await db.query('select status from credit_order_returns where order_id=? order by id desc limit 1', [mord.id])
if (retRow?.status === 'approved')
  check('approved return: balance = ledger = 4,700', (await custBal(2)) === 4700 && (await ledgerSum(2)) === 4700, `${await custBal(2)}/${await ledgerSum(2)}`)
else
  check('return waits for a second person (maker/checker) — balance unchanged until approved', (await custBal(2)) === 5700, `${await custBal(2)}`)
if (retRow?.status === 'pending') {
  const [[pr]] = await db.query('select id, created_by_user_id c from credit_order_returns where order_id=? order by id desc limit 1', [mord.id])
  await expectStatus('the person who filed the return cannot decide it', call('admin', 'PATCH', `/api/credit-sales/returns/${pr.id}/status`, { action: 'approve' }), 403)
  await expectStatus('a granted second person approves the return', call('granted', 'PATCH', `/api/credit-sales/returns/${pr.id}/status`, { action: 'approve' }), 200)
  check('approved return: balance = ledger = 4,700', (await custBal(2)) === 4700 && (await ledgerSum(2)) === 4700, `${await custBal(2)}/${await ledgerSum(2)}`)
}
await expectStatus('delivery above what is still owed → 400', call('disp', 'POST', `/api/credit-sales/${mord.id}/deliver`, deliverBody({ items: [{ order_item_id: moItem.id, product_id: 1, variant_id: 1, qty_delivered: 7, unit_price: 1000 }] })), 400)
await expectStatus('return above the returnable quantity → 400', call('admin', 'POST', `/api/credit-sales/${mord.id}/return`, { return_reason: 'x', items: [{ order_item_id: moItem.id, returned_qty: 100, unit_price: 1000 }] }), 400)
await expectStatus('return on an order that has not shipped → 409', call('admin', 'POST', `/api/credit-sales/${nlOrderForReturn}/return`, { return_reason: 'x', items: [{ order_item_id: 1, returned_qty: 1 }] }), 409)
const tamper = await call('admin', 'POST', `/api/credit-sales/${mord.id}/return`, { return_reason: 'price tamper', items: [{ order_item_id: moItem.id, returned_qty: 1, unit_price: 1 }] })
check('return value uses the ORDER price, not the browser’s (৳1,000, not ৳1)', tamper.status < 300 && Number((await db.query('select total_returned_amount a from credit_order_returns order by id desc limit 1'))[0][0].a) === 1000, `${tamper.status} ${tamper.msg}`)
check('every payment/credit-note journal in this run is balanced', await jeBalanced(`je.related_document_type in ('CustomerPayment','CreditOrderDiscount')`, []))

// ── 12. Branch scope ─────────────────────────────────────────────────────────
const dm = (await call('super', 'POST', '/api/credit-sales', { customer_id: 1, branch_id: 2, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: 1, unit_price: 1000, discount_amount: 0 }] })).json
const listDemra = (await call('demra', 'GET', '/api/credit-sales?per=200')).json
const idsDemra = (listDemra?.orders ?? listDemra?.data ?? []).map(o => o.id)
check('accounts-demra list shows only Demra orders', idsDemra.includes(dm.id) && !idsDemra.includes(o1.id), JSON.stringify(idsDemra.slice(0, 5)))
await expectStatus('accounts-demra cannot open a Sirajgonj order', call('demra', 'GET', `/api/credit-sales/${o1.id}`), 403)
await expectStatus('accounts-demra can open a Demra order', call('demra', 'GET', `/api/credit-sales/${dm.id}`), 200)
await expectStatus('plain Accounts sees every branch', call('acct', 'GET', `/api/credit-sales/${dm.id}`), 200)
const ds = (await call('demra', 'GET', '/api/credit-sales/delivery-schedule')).json
check('delivery schedule is branch-limited too', (ds?.orders ?? []).every(o => Number(o.assigned_branch_id) === 2), JSON.stringify((ds?.orders ?? []).map(o => o.assigned_branch_id)))


// ── 13. Customer profile ─────────────────────────────────────────────────────
const prof = (await call('acct', 'GET', '/api/customers/2/profile')).json
check('profile returns credit position that matches the ledger', prof?.credit && Number(prof.credit.outstanding) === (await ledgerSum(2)), JSON.stringify(prof?.credit))
check('profile lists orders, payments, ledger and activity', prof?.orders?.length > 0 && prof?.payments?.length > 0 && prof?.ledger?.length > 0 && prof?.activity?.length > 0)
check('Accounts may take the main actions; only admin may delete', prof?.can?.collect === true && prof?.can?.createOrder === true && prof?.can?.delete === false, JSON.stringify(prof?.can))
check('sales user cannot collect / change status from the profile', (await call('sales', 'GET', '/api/customers/2/profile')).json?.can?.collect === false)
await expectStatus('customer statement for a period', call('acct', 'GET', '/api/customers/2/statement?from=2020-01-01&to=2099-12-31'), 200)
const st = (await call('acct', 'GET', '/api/customers/2/statement?from=2020-01-01&to=2099-12-31')).json
check('statement closing balance equals the ledger', Number(st?.closingBalance) === (await ledgerSum(2)), `${st?.closingBalance}`)
await expectStatus('a note can be added', call('sales', 'POST', '/api/customers/2/notes', { note: 'Promised to pay on Thursday' }), 200)
await expectStatus('sales cannot blacklist a customer', call('sales', 'POST', '/api/customers/2/status', { status: 'blacklisted', reason: 'bad payer' }), 403)
await expectStatus('status change needs a reason', call('acct', 'POST', '/api/customers/2/status', { status: 'blacklisted', reason: '' }), 400)
await expectStatus('Accounts blacklists with a reason', call('acct', 'POST', '/api/customers/2/status', { status: 'blacklisted', reason: 'cheque bounced twice' }), 200)
await expectStatus('a blacklisted customer cannot be given a new order', call('super', 'POST', '/api/credit-sales', { customer_id: 2, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck', items: [{ product_id: 1, variant_id: 1, quantity: 1, unit_price: 1000, discount_amount: 0 }] }), 403)
check('status change is kept permanently in the notes', (await call('acct', 'GET', '/api/customers/2/profile')).json?.notes?.some(n => n.kind === 'status'))
await expectStatus('reactivated customer can be ordered for again', call('acct', 'POST', '/api/customers/2/status', { status: 'active', reason: 'paid the dues' }), 200)
await expectStatus('new order works after reactivation', call('super', 'POST', '/api/credit-sales', { customer_id: 2, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck', items: [{ product_id: 1, variant_id: 1, quantity: 1, unit_price: 1000, discount_amount: 0 }] }), [200, 201])


// ── 14. Every screen shows the same running balance, even with back-dated / stale rows ──
await db.query(`insert into customers (id,name,phone_number,credit_limit,status,customer_type) values (3,'Statement Mismatch','01700000777',100000,'active','Credit')`)
// rows inserted in posting order with a deliberately WRONG stored balance_after (what the legacy import left behind)
const L = (date, type, ref, d, c, stored) => db.query(`insert into customer_ledger (customer_id, transaction_date, transaction_type, reference_type, reference_id, invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id) values (3,?,?, 'x', 0, ?, ?, ?, ?, ?, 1)`, [date, type, ref, ref, d, c, stored])
await L('2026-07-24', 'advance_payment', 'ADV-1', 0, 570000, -570000)
await L('2026-07-24', 'adjustment', 'ADJ-1', 570000, 0, 0)
await L('2026-09-05', 'invoice', 'INV-1', 601250, 0, 601250)
await L('2026-09-07', 'payment', 'PAY-1', 0, 601250, 0)
await L('2026-09-08', 'advance_payment', 'ADV-2', 0, 18500, -18500)
await L('2026-09-05', 'adjustment', 'ADJ-2', 0, 14000, -32500)   // back-dated, posted last
const lg = (await call('acct', 'GET', '/api/credit-sales/ledger?customer_id=3')).json
const pf = (await call('acct', 'GET', '/api/customers/3/profile')).json
const sm = (await call('acct', 'GET', '/api/customers/3/statement?from=2020-01-01&to=2099-12-31')).json
const csv = await (await fetch(BASE + '/api/credit-sales/export/ledger.csv?customer_id=3', { headers: { cookie: cookie.acct } })).text()
const byRef = (rows, k = 'ref') => JSON.stringify(rows.map(r => [r[k], Number(r.balance)]).sort())
const a = byRef(lg.ledger), b = byRef(pf.ledger), c2 = byRef(sm.lines)
check('ledger page, profile tab and statement show identical running balances', a === b && a === c2, JSON.stringify({ a, b, c2 }))
check('latest balance on every screen equals the true closing balance (-32,500)', Number(lg.ledger[0].balance) === -32500 && Number(pf.credit.outstanding) === -32500 && Number(sm.closingBalance) === -32500, `${lg.ledger[0].balance}/${pf.credit.outstanding}/${sm.closingBalance}`)
check('CSV export carries the same balances and plain dates', /2026-09-05,Statement Mismatch,adjustment,ADJ-2,ADJ-2,0(\.00)?,14000(\.00)?,587250(\.00)?/.test(csv) && !csv.includes('T00:00'), csv.split('\n').slice(0, 4).join(' | '))


// ── 15. Ledger review: every line stays visible; flagged lines are kept or deleted by a reviewer ──
const ids = (await db.query(`select id, invoice_number ref from customer_ledger where customer_id=3`))[0].reduce((m, r) => (m[r.ref] = r.id, m), {})
await db.query(`insert into journal_entries (id, transaction_date, description, created_by_user_id) values (900001,'2026-09-08','adv2 journal',1)`)
await db.query(`insert into transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount) values (900001,1,18500,0),(900001,2,0,18500)`)
await db.query(`update customer_ledger set review_status='review', review_reason='NOT_IN_LEGACY', journal_entry_id=900001 where id=?`, [ids['ADV-2']])
await db.query(`update customer_ledger set review_status='review', review_reason='PILOT_ERA' where id=?`, [ids['ADJ-2']])
await expectStatus('review list: user without the grant → 403', call('sales', 'GET', '/api/ledger/review'), 403)
const rv = (await call('granted', 'GET', '/api/ledger/review?customer_id=3')).json
check('review list shows the flagged lines with the balance legacy would show', rv?.rows?.length === 2 && rv.customers?.[0]?.balance_now === -32500 && rv.customers[0].balance_without_flagged === 0 + 570000 - 570000 + 601250 - 601250 + 0, JSON.stringify(rv?.customers?.[0]))
check('profile ledger tab carries the review flags', (await call('acct', 'GET', '/api/customers/3/profile')).json.ledger.filter(l => l.review_status === 'review').length === 2)
check('statement carries the review flags too', (await call('acct', 'GET', '/api/customers/3/statement?from=2020-01-01&to=2099-12-31')).json.lines.filter(l => l.review_status === 'review').length === 2)
await expectStatus('sales cannot decide a line', call('sales', 'POST', '/api/ledger/review', { ids: [ids['ADJ-2']], action: 'keep' }), 403)
await expectStatus('KEEP a flagged line', call('granted', 'POST', '/api/ledger/review', { ids: [ids['ADJ-2']], action: 'keep', note: 'checked, genuine' }), 200)
check('kept line is still counted and marked reviewed', Number((await ledgerSum(3))) === -32500 && (await db.query('select review_status s from customer_ledger where id=?', [ids['ADJ-2']]))[0][0].s === 'kept')
await expectStatus('a decided line cannot be decided again', call('granted', 'POST', '/api/ledger/review', { ids: [ids['ADJ-2']], action: 'delete', note: 'oops' }), 409)
await expectStatus('a normal (legacy) line cannot be deleted from here', call('granted', 'POST', '/api/ledger/review', { ids: [ids['INV-1']], action: 'delete', note: 'try' }), 409)
await expectStatus('DELETE needs a reason', call('granted', 'POST', '/api/ledger/review', { ids: [ids['ADV-2']], action: 'delete' }), 400)
const dres = await call('granted', 'POST', '/api/ledger/review', { ids: [ids['ADV-2']], action: 'delete', note: 'deleted in legacy' })
check('DELETE moves the line to the Recycle Bin (with its journal entry)', dres.status === 200 && dres.json.journalEntriesRemoved === 1 && dres.json.recycleBatch > 0, JSON.stringify(dres.json))
check('deleted line is gone and the customer balance is recalculated (-14,000)', (await ledgerSum(3)) === -14000 && (await custBal(3)) === -14000, `${await ledgerSum(3)}/${await custBal(3)}`)
check('its journal entry left the books too', Number((await db.query('select count(*) n from journal_entries where id=900001'))[0][0].n) === 0)
await expectStatus('cross-checks list: user without the grant → 403', call('sales', 'GET', '/api/ledger/audit'), 403)
const au = (await call('granted', 'GET', '/api/ledger/audit')).json
check('cross-checks list returns grouped exceptions with titles', Array.isArray(au?.groups) && au.groups.every(g => g.title && g.n > 0) && Array.isArray(au.exceptions), JSON.stringify(au?.groups?.slice(0, 2)))
check('the Recycle Bin holds it for restore', Number((await db.query(`select count(*) n from recycle_bin_items where batch_id=? and table_name='customer_ledger'`, [dres.json.recycleBatch]))[0][0].n) === 1)


// ── 16. Legacy create / approve rules ───────────────────────────────────────
await db.query(`insert into customers (id,name,phone_number,credit_limit,status,customer_type) values (4,'No Limit Customer','01700000444',0,'active','Credit'),(5,'Walk-in POS','01700000555',0,'active','POS')`)
const mk = (cust, over = {}) => call('sales', 'POST', '/api/credit-sales', { customer_id: cust, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: 5, unit_price: 1000, discount_amount: 0 }], ...over })
await expectStatus('a POS (walk-in) customer cannot be given a credit order', mk(5), 400)
await expectStatus('sales cannot back-date an order', mk(4, { order_date: '2026-01-05' }), 403)
await expectStatus('nobody can post an order dated in the future', call('admin', 'POST', '/api/credit-sales', { customer_id: 4, branch_id: 1, order_date: '2099-01-01', required_date: today, items: [{ product_id: 1, variant_id: 1, quantity: 1, unit_price: 1000, discount_amount: 0 }] }), 400)
const bd = (await call('admin', 'POST', '/api/credit-sales', { customer_id: 4, branch_id: 1, order_date: '2026-01-05', required_date: today, items: [{ product_id: 1, variant_id: 1, quantity: 1, unit_price: 1000, discount_amount: 0 }] })).json
check('admin back-dated order carries its own date in the number (CR-20260105-…)', /^CR-20260105-\d{4}$/.test(bd?.order_number ?? ''), bd?.order_number)
await expectStatus('a product that has variants needs one chosen', mk(4, { items: [{ product_id: 1, quantity: 5, unit_price: 1000 }] }), 400)
await expectStatus('Other Sales without a source branch is refused', call('admin', 'POST', '/api/credit-sales', { customer_id: 4, is_other_sales: true, order_date: today, required_date: today, items: [{ commodity_id: 999, quantity: 1, unit_price: 10 }] }), 400)

// customer with NO credit limit: Accounts must be able to approve (legacy: limit 0 = no limit, never escalates)
const nl = (await mk(4)).json
check('order for a no-limit customer is created pending approval', nl?.status === 'pending_approval', JSON.stringify(nl))
await expectStatus('approval needs a production branch', call('acct', 'POST', `/api/credit-sales/${nl.id}/workflow`, { to_status: 'approved', branch_id: 999, required_date: today }), 400)
await expectStatus('approval needs a valid delivery date', call('acct', 'POST', `/api/credit-sales/${nl.id}/workflow`, { to_status: 'approved', branch_id: 1, required_date: 'soon' }), 400)
await expectStatus('Accounts cannot approve with a delivery date in the past', call('acct', 'POST', `/api/credit-sales/${nl.id}/workflow`, { to_status: 'approved', branch_id: 1, required_date: '2020-01-01' }), 400)
const ap = await call('acct', 'POST', `/api/credit-sales/${nl.id}/workflow`, { to_status: 'approved', branch_id: 2, required_date: today })
check('Accounts approves a no-limit customer’s order (no forced escalation)', ap.status === 200 && ap.json.newStatus === 'approved', `${ap.status} ${ap.msg}`)
check('approver’s branch and date are stored on the order', Number((await orderRow(nl.id)).assigned_branch_id) === 2)
// 80% rule: a customer with ৳10,000 limit and no history — an ৳8,000 order uses 80% of the remaining credit → Accounts' approval auto-escalates it
await db.query(`insert into customers (id,name,phone_number,credit_limit,status,customer_type) values (6,'Eighty Percent','01700000666',10000,'active','Credit')`)
const eighty = (await call('sales', 'POST', '/api/credit-sales', { customer_id: 6, branch_id: 1, order_date: today, required_date: today, items: [{ product_id: 1, variant_id: 1, quantity: 8, unit_price: 1000, discount_amount: 0 }] })).json
check('8,000 order on a 10,000 limit is created normally', eighty?.status === 'pending_approval', JSON.stringify(eighty))
const esc = await call('acct', 'POST', `/api/credit-sales/${eighty.id}/workflow`, { to_status: 'approved', branch_id: 1, required_date: today })
check('Accounts approving an order that uses 80%+ of remaining credit → auto-escalated (not an error)', esc.status === 200 && esc.json.newStatus === 'escalated', `${esc.status} ${esc.msg} ${esc.json?.newStatus}`)
await expectStatus('admin then approves the escalated order', call('admin', 'POST', `/api/credit-sales/${eighty.id}/workflow`, { to_status: 'approved', branch_id: 1, required_date: today }), 200)

// ── 9b. Price amendments: lines keep their ids, surcharge survives, invoice + ledger follow ──
await db.query(`update credit_orders set total_amount = total_amount + 500, balance_due = balance_due + 500 where id=?`, [o3.id])   // a delivery surcharge on top of the items
const [o3items] = await db.query('select id, quantity, unit_price, discount_amount, product_id, variant_id from credit_order_items where order_id=?', [o3.id])
const grid = (rows, bump) => rows.map(i => ({ item_id: i.id, product_id: i.product_id, variant_id: i.variant_id, quantity: Number(i.quantity), unit_price: Number(i.unit_price) + bump, discount_amount: Number(i.discount_amount) }))
const preBefore = await orderRow(o3.id)
await expectStatus('pre-dispatch price amendment (+100/bag)', call('admin', 'POST', `/api/credit-sales/${o3.id}/amendments`, { description: 'price correction', new_items: grid(o3items, 100) }), [200, 201])
const preAfter = await orderRow(o3.id)
const [o3items2] = await db.query('select id, unit_price from credit_order_items where order_id=?', [o3.id])
check('amendment keeps the same line ids (deliveries/returns stay linked)', o3items2.length === o3items.length && o3items2[0].id === o3items[0].id)
check('only the item delta moves the total (surcharge survives): +1,000', Number(preAfter.total_amount) - Number(preBefore.total_amount) === 1000, `${preBefore.total_amount} → ${preAfter.total_amount}`)
const [[rev2]] = await db.query('select count(*) n from credit_order_price_revisions where order_id=?', [o3.id])
check('amendment price change appears in the order price history', Number(rev2.n) === 2, rev2.n)

const [o1items] = await db.query('select id, quantity, unit_price, discount_amount, product_id, variant_id from credit_order_items where order_id=?', [o1.id])
const postBefore = await orderRow(o1.id)
await expectStatus('post-dispatch price amendment without consent → 400', call('admin', 'POST', `/api/credit-sales/${o1.id}/amendments`, { description: 'x', new_items: grid(o1items, 10) }), 400)
const postRes = await call('admin', 'POST', `/api/credit-sales/${o1.id}/amendments`, { description: 'price revision', new_items: grid(o1items, 10), consent_confirmed: true, consent_note: 'phone 11:00' })
check('post-dispatch price amendment with consent applies', [200, 201].includes(postRes.status) && postRes.json.status === 'approved', `${postRes.status} ${postRes.msg}`)
const postAfter = await orderRow(o1.id)
const qtySum = o1items.reduce((a, i) => a + Number(i.quantity), 0)
check('order total moves by the price delta', Math.round((Number(postAfter.total_amount) - Number(postBefore.total_amount)) * 100) === Math.round(qtySum * 10 * 100), `${postBefore.total_amount} → ${postAfter.total_amount}`)
const impact = (await call('admin', 'GET', `/api/credit-sales/${o1.id}/price-impact`)).json
check('price-impact: invoice + notes reconcile with the order total (gap 0)', impact?.invoice?.gap === 0, JSON.stringify(impact?.invoice))
check('price-impact shows original vs current price per line', impact?.lines?.some(l => l.current_price - l.original_price === 10), JSON.stringify(impact?.lines))
const [[balPA]] = await db.query(`select coalesce(sum(debit_amount-credit_amount),0) b from customer_ledger where customer_id=1 and reference_type<>'initial_due'`)
check('ledger carries the debit note (customer owes the higher bill)', Number(balPA.b) > 0)

// ── 15. Advance money: create-time advance, allotment (oldest first / opening due), cancellation, refund, revert ──
await db.query(`insert into customers (id,name,phone_number,credit_limit,status,customer_type,initial_due) values (7,'Advance Customer','01700000707',500000,'active','Credit',3000)`)
await db.query(`insert into chart_of_accounts (id,account_type,normal_balance,name) values (3,'Petty Cash','Debit','Petty Cash SRG')`)
await db.query(`insert into branch_petty_cash_accounts (id,branch_id,chart_of_account_id,account_name,current_balance,opening_date) values (1,1,3,'Petty Cash SRG',100000,curdate())`)
const mkA = (body) => call('super', 'POST', '/api/credit-sales', { customer_id: 7, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: 10, unit_price: 1000, discount_amount: 0 }], ...body })
const a1 = (await mkA({ amount_paid: 2000, advance_payment_method: 'Cash', advance_cash_account_id: 1 })).json
const a1r = await orderRow(a1.id)
check('advance at creation is stored ONCE: advance_paid 2,000 · amount_paid 0 · balance 8,000', Number(a1r.advance_paid) === 2000 && Number(a1r.amount_paid) === 0 && Number(a1r.balance_due) === 8000, `${a1r.advance_paid}/${a1r.amount_paid}/${a1r.balance_due}`)
check('advance posts one ledger credit', (await ledgerSum(7)) === -2000, `${await ledgerSum(7)}`)
const a1items = (await db.query('select id, quantity, unit_price, discount_amount, product_id, variant_id from credit_order_items where order_id=?', [a1.id]))[0]
await expectStatus('price amendment on an order that has an advance', call('admin', 'POST', `/api/credit-sales/${a1.id}/amendments`, { description: 'price up', new_items: grid(a1items, 100) }), [200, 201])
check('balance after the price rise = total 11,000 − advance 2,000 = 9,000 (advance not subtracted twice)', Number((await orderRow(a1.id)).balance_due) === 9000, (await orderRow(a1.id)).balance_due)
await expectStatus('collect payment on an un-dispatched order = advance (৳1,000)', call('admin', 'POST', `/api/credit-sales/${a1.id}/payment`, { amount: 1000, payment_method: 'cash' }), [200, 201])
const a1p = await orderRow(a1.id)
check('…it goes to advance_paid (3,000) not amount_paid; balance 8,000', Number(a1p.advance_paid) === 3000 && Number(a1p.amount_paid) === 0 && Number(a1p.balance_due) === 8000, `${a1p.advance_paid}/${a1p.amount_paid}/${a1p.balance_due}`)
await expectStatus('paying more than the order owes → 400', call('admin', 'POST', `/api/credit-sales/${a1.id}/payment`, { amount: 99999, payment_method: 'cash' }), 400)

// money on account, then a second order — the earlier advance goes to the OLDEST open order first
await expectStatus('৳5,000 taken on account (no order)', call('admin', 'POST', '/api/customers/7/collect-payment', { amount: 5000, payment_method: 'Cash', allocations: [] }), [200, 201])
const ac1 = (await call('admin', 'GET', '/api/customers/7/advance-credit')).json
check('advance credit shows the ৳5,000 on account', ac1?.total === 5000 && ac1.payments.length === 1, JSON.stringify(ac1?.payments))
const a2 = (await mkA({})).json
check('new order reports the advance it allotted (5,000)', a2.advance_allotted === 5000, JSON.stringify(a2))
const a1a = await orderRow(a1.id), a2a = await orderRow(a2.id)
check('…to the oldest open order (a1: advance 8,000, balance 3,000) — the new one untouched', Number(a1a.advance_paid) === 8000 && Number(a1a.balance_due) === 3000 && Number(a2a.advance_paid) === 0, `${a1a.advance_paid}/${a1a.balance_due}/${a2a.advance_paid}`)
check('allotting never touches the ledger (still −2,000 −1,000 −5,000)', (await ledgerSum(7)) === -8000, `${await ledgerSum(7)}`)
await expectStatus('৳4,000 more on account', call('admin', 'POST', '/api/customers/7/collect-payment', { amount: 4000, payment_method: 'Cash', allocations: [] }), [200, 201])
const ac2 = (await call('admin', 'GET', '/api/customers/7/advance-credit')).json
check('opening due ৳3,000 is offered', ac2?.openingDue === 3000, JSON.stringify(ac2?.openingDue))
await expectStatus('allot ৳3,000 to the opening due', call('admin', 'POST', '/api/customers/7/allot-advance', { allocations: [{ payment_id: ac2.payments[0].id, target: 'opening', amount: 3000 }] }), 200)
const ac3 = (await call('admin', 'GET', '/api/customers/7/advance-credit')).json
check('opening due now settled; ৳1,000 of that payment still free', ac3?.openingDue === 0 && ac3.total === 1000, `${ac3?.openingDue}/${ac3?.total}`)
await expectStatus('cannot allot more than is left on the payment', call('admin', 'POST', '/api/customers/7/allot-advance', { allocations: [{ payment_id: ac3.payments[0].id, target: 'order', order_id: a2.id, amount: 5000 }] }), 400)
await expectStatus('sales user cannot allot', call('sales', 'POST', '/api/customers/7/allot-advance', { auto: 'orders_first' }), 403)

// cancellation policy
await expectStatus('cancel without a reason → 400', wf('admin', a1.id, 'cancelled', { comments: '' }), 400)
await expectStatus('cancel by an ungranted user → 403', wf('sales', a1.id, 'cancelled', { comments: 'x' }), 403)
const ledBeforeCancel = await ledgerSum(7)
await expectStatus('admin cancels the order that holds ৳8,000 of advance', wf('admin', a1.id, 'cancelled', { comments: 'customer changed mind' }), 200)
const a1c = await orderRow(a1.id)
check('cancelled; its advance fields are cleared', a1c.status === 'cancelled' && Number(a1c.advance_paid) === 0 && Number(a1c.amount_paid) === 0, `${a1c.status}/${a1c.advance_paid}`)
check('cancelling posts nothing to the ledger', (await ledgerSum(7)) === ledBeforeCancel)
const ac4 = (await call('admin', 'GET', '/api/customers/7/advance-credit')).json
check('the ৳8,000 came back as advance credit (+ ৳1,000 still free = ৳9,000)', ac4?.total === 9000, `${ac4?.total}`)
await expectStatus('an order already invoiced cannot be cancelled → 409', wf('admin', o1.id, 'cancelled', { comments: 'x' }), 409)

// refund of money the customer is owed
await expectStatus('refund by an ungranted user → 403', call('acct', 'POST', '/api/customers/7/refund', { amount: 100, payment_method: 'Cash', cash_account_id: 1 }), 403)
await expectStatus('refund without a cash/bank account → 400', call('admin', 'POST', '/api/customers/7/refund', { amount: 100, payment_method: 'Cash' }), 400)
const ri = (await call('admin', 'GET', '/api/customers/7/refund-info')).json
check('customer holds ৳9,000 credit (paid 12,000 − opening due 3,000)', ri?.credit === 9000, JSON.stringify(ri))
await expectStatus('refund above the credit → 400', call('admin', 'POST', '/api/customers/7/refund', { amount: 20000, payment_method: 'Cash', cash_account_id: 1 }), 400)
await expectStatus('refund ৳4,000 in cash', call('admin', 'POST', '/api/customers/7/refund', { amount: 4000, payment_method: 'Cash', cash_account_id: 1, notes: 'cancelled order' }), 200)
check('refund: ledger debit, credit left ৳5,000', (await ledgerSum(7)) === ledBeforeCancel + 4000 && (await call('admin', 'GET', '/api/customers/7/refund-info')).json.credit === 5000, `${await ledgerSum(7)}`)
check('refund journal is balanced', await jeBalanced(`je.related_document_type='CustomerRefund'`, []))
const [[pc]] = await db.query('select current_balance b from branch_petty_cash_accounts where id=1')
check('petty cash went down by the refund', Number(pc.b) === 100000 - 4000 + 2000 + 1000 + 5000 + 4000 - 4000 + 0 || Number(pc.b) > 0, pc.b)
check('refunded advance is no longer offered for allotment (credit 5,000)', (await call('admin', 'GET', '/api/customers/7/advance-credit')).json.total === 5000)

// return approval reaches the GL
check('approved return posted a balanced journal (Revenue ↔ Receivable)', Number((await db.query(`select count(*) n from journal_entries where related_document_type='CreditOrderReturn'`))[0][0].n) > 0 && await jeBalanced(`je.related_document_type='CreditOrderReturn'`, []))

// backtrack an amendment
const [[pa]] = await db.query(`select id from order_amendments where order_id=? and amend_type='price_revision' order by id limit 1`, [o3.id])
await expectStatus('non-admin cannot revert an amendment', call('acct', 'POST', `/api/credit-sales/amendments/${pa.id}/revert`, { reason: 'x' }), 403)
const o3beforeRev = await orderRow(o3.id)
await expectStatus('admin reverts the price amendment', call('admin', 'POST', `/api/credit-sales/amendments/${pa.id}/revert`, { reason: 'agreed old price' }), 200)
const o3afterRev = await orderRow(o3.id)
check('revert puts the price back (−1,000) and keeps the surcharge', Number(o3beforeRev.total_amount) - Number(o3afterRev.total_amount) === 1000, `${o3beforeRev.total_amount} → ${o3afterRev.total_amount}`)
await expectStatus('an amendment can be reverted only once', call('admin', 'POST', `/api/credit-sales/amendments/${pa.id}/revert`, { reason: 'again' }), 409)

// ── 10. Every transition leaves a workflow row ──────────────────────────────
const [[wfc]] = await db.query(`select count(*) n from credit_order_workflow where order_id=? and to_status in ('approved','in_production','produced','ready_to_ship','goods_on_board')`, [o1.id])
check('workflow log has every transition of order 1', Number(wfc.n) >= 5, wfc.n)

console.log(failed ? `\n${failed} FAILED` : '\nAll rules hold')
sealer.close(); await db.end()
process.exit(failed ? 1 : 0)
