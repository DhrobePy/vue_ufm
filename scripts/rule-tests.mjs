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
await wf('prod', o2.id, 'in_production'); await call('admin', 'POST', `/api/credit-sales/${o2.id}/gates`, { action: 'clear_dispatch', note: 'ok' }); await wf('prod', o2.id, 'ready_to_ship')
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
  customers: { enabled: true, pages: ['list'], actions: { list: { set_opening_balance: true } } },
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
await db.query(`insert into customers (id,name,phone_number,credit_limit,status) values (2,'Money Customer','01700000099',500000,'active')`)
const mord = (await call('super', 'POST', '/api/credit-sales', { customer_id: 2, branch_id: 1, order_date: today, required_date: today, delivery_type: 'big_truck',
  items: [{ product_id: 1, variant_id: 1, quantity: 10, unit_price: 1000, discount_amount: 0 }] })).json
await wf('prod', mord.id, 'in_production'); await call('admin', 'POST', `/api/credit-sales/${mord.id}/gates`, { action: 'clear_dispatch', note: 'ok' }); await wf('prod', mord.id, 'ready_to_ship')
await wf('disp', mord.id, 'goods_on_board', { dispatch: truck })
check('after dispatch: customer balance = ledger = 10,000', (await custBal(2)) === 10000 && (await ledgerSum(2)) === 10000, `${await custBal(2)}/${await ledgerSum(2)}`)
await expectStatus('admin records a ৳4,000 payment', call('admin', 'POST', `/api/credit-sales/${mord.id}/payment`, { amount: 4000, payment_method: 'bank', bank_account_id: null }), [200, 201])
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

// ── 10. Every transition leaves a workflow row ──────────────────────────────
const [[wfc]] = await db.query(`select count(*) n from credit_order_workflow where order_id=? and to_status in ('approved','in_production','ready_to_ship','goods_on_board')`, [o1.id])
check('workflow log has every transition of order 1', Number(wfc.n) >= 4, wfc.n)

console.log(failed ? `\n${failed} FAILED` : '\nAll rules hold')
sealer.close(); await db.end()
process.exit(failed ? 1 : 0)
