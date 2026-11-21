import { Z as defineEventHandler, bn as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const cashflow_get = defineEventHandler(async () => {
  const dh = (d = /* @__PURE__ */ new Date()) => new Date(d.getTime() + 6 * 36e5);
  const iso = (d) => d.toISOString().slice(0, 10);
  const now = dh(), today = iso(now);
  const mStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), mEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const pStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)), pEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
  const [ms, me, ps, pe] = [iso(mStart), iso(mEnd), iso(pStart), iso(pEnd)];
  const one = async (sql, p = []) => {
    var _a, _b;
    return Number((_b = (_a = (await query(sql, p))[0]) == null ? void 0 : _a.v) != null ? _b : 0);
  };
  const live = "reversed_at IS NULL";
  const cin = (a, b) => one(`SELECT COALESCE(SUM(amount),0) v FROM customer_payments WHERE payment_date BETWEEN ? AND ? AND ${live}`, [a, b]);
  const sup = (a, b) => one(`SELECT COALESCE(SUM(amount_paid),0) v FROM purchase_payments_adnan WHERE is_posted = 1 AND payment_date BETWEEN ? AND ?`, [a, b]);
  const exp = (a, b) => one(`SELECT COALESCE(SUM(total_amount),0) v FROM expense_vouchers WHERE status = 'approved' AND expense_date BETWEEN ? AND ?`, [a, b]);
  const rmq = (a, b) => one(`SELECT COALESCE(SUM(quantity_received_kg),0) v FROM goods_received_adnan WHERE grn_status <> 'cancelled' AND grn_date BETWEEN ? AND ?`, [a, b]);
  const sal = (a, b) => one(`SELECT COALESCE(SUM(co.total_amount),0) v FROM credit_orders co WHERE co.status IN ('shipped','delivered') AND co.order_date BETWEEN ? AND ?`, [a, b]);
  const [inToday, inMonth, inPrev, supToday, supMonth, supPrev, expToday, expMonth, expPrev] = await Promise.all([cin(today, today), cin(ms, me), cin(ps, pe), sup(today, today), sup(ms, me), sup(ps, pe), exp(today, today), exp(ms, me), exp(ps, pe)]);
  const inCount = await one(`SELECT COUNT(*) v FROM customer_payments WHERE payment_date BETWEEN ? AND ? AND ${live}`, [ms, me]);
  const inBank = await one(`SELECT COALESCE(SUM(amount),0) v FROM customer_payments WHERE payment_date BETWEEN ? AND ? AND payment_method <> 'Cash' AND ${live}`, [ms, me]);
  const receivables = await one(`SELECT COALESCE(SUM(current_balance),0) v FROM customers WHERE current_balance > 0.01 AND customer_type = 'Credit'`);
  const payables = await one(
    `SELECT COALESCE(SUM(GREATEST(0, bal)),0) v FROM (
       SELECT COALESCE(g.q, 0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount, 0) - COALESCE(p.paid, 0) AS bal
       FROM purchase_orders_adnan po
       LEFT JOIN (SELECT purchase_order_id, SUM(expected_quantity) q FROM goods_received_adnan WHERE grn_status <> 'cancelled' GROUP BY purchase_order_id) g ON g.purchase_order_id = po.id
       LEFT JOIN (SELECT purchase_order_id, SUM(amount_paid) paid FROM purchase_payments_adnan WHERE is_posted = 1 GROUP BY purchase_order_id) p ON p.purchase_order_id = po.id) t`
  );
  const openPo = (await query(`SELECT COUNT(*) n, COALESCE(SUM(total_order_value),0) v FROM purchase_orders_adnan WHERE delivery_status NOT IN ('completed','closed','cancelled')`))[0];
  const pendingSales = (await query(`SELECT COUNT(*) n, COALESCE(SUM(total_amount),0) v FROM credit_orders WHERE status IN ('approved','in_production','produced','ready_to_ship')`))[0];
  const d30 = iso(new Date(now.getTime() - 29 * 864e5));
  const day = async (sql) => new Map((await query(sql, [d30, today])).map((r) => [String(r.d).slice(0, 10), Number(r.v)]));
  const [dIn, dSup, dExp] = await Promise.all([
    day(`SELECT payment_date d, SUM(amount) v FROM customer_payments WHERE ${live} AND payment_date BETWEEN ? AND ? GROUP BY payment_date`),
    day(`SELECT payment_date d, SUM(amount_paid) v FROM purchase_payments_adnan WHERE is_posted = 1 AND payment_date BETWEEN ? AND ? GROUP BY payment_date`),
    day(`SELECT expense_date d, SUM(total_amount) v FROM expense_vouchers WHERE status = 'approved' AND expense_date BETWEEN ? AND ? GROUP BY expense_date`)
  ]);
  const daily = Array.from({ length: 30 }, (_, i) => {
    var _a, _b, _c;
    const d = iso(new Date(now.getTime() - (29 - i) * 864e5));
    const i1 = (_a = dIn.get(d)) != null ? _a : 0, o1 = ((_b = dSup.get(d)) != null ? _b : 0) + ((_c = dExp.get(d)) != null ? _c : 0);
    return { date: d, inflow: i1, outflow: o1, net: i1 - o1 };
  });
  const trend = [];
  for (let k = 5; k >= 0; k--) {
    const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k, 1)), e = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k + 1, 0));
    const [a, b] = [iso(s), iso(e)];
    trend.push({ month: a.slice(0, 7), sales: await sal(a, b), inflow: await cin(a, b), outflow: await sup(a, b) + await exp(a, b), rm_kg: await rmq(a, b) });
  }
  const recentIn = await query(`SELECT cp.payment_date AS date, cp.payment_number AS ref, c.name AS party, cp.amount, cp.payment_method AS method FROM customer_payments cp JOIN customers c ON c.id = cp.customer_id WHERE cp.${live} ORDER BY cp.created_at DESC LIMIT 8`);
  const recentOut = await query(`SELECT payment_date AS date, payment_voucher_number AS ref, supplier_name AS party, amount_paid AS amount, payment_method AS method FROM purchase_payments_adnan WHERE is_posted = 1 ORDER BY created_at DESC LIMIT 8`);
  const recentGrn = await query(`SELECT grn_date AS date, grn_number AS ref, supplier_name AS party, quantity_received_kg AS qty_kg, total_value AS amount FROM goods_received_adnan WHERE grn_status <> 'cancelled' ORDER BY created_at DESC LIMIT 8`);
  return {
    month: ms.slice(0, 7),
    today,
    inflow: { today: inToday, month: inMonth, prev: inPrev, count: inCount, bank: inBank, cash: inMonth - inBank },
    supplier: { today: supToday, month: supMonth, prev: supPrev },
    expense: { today: expToday, month: expMonth, prev: expPrev },
    net: { today: inToday - supToday - expToday, month: inMonth - supMonth - expMonth, prev: inPrev - supPrev - expPrev },
    receivables,
    payables,
    openPo,
    pendingSales,
    rm: { month_kg: await rmq(ms, me), prev_kg: await rmq(ps, pe), today_kg: await rmq(today, today) },
    sales: { month: await sal(ms, me), prev: await sal(ps, pe) },
    daily,
    trend,
    recentIn,
    recentOut,
    recentGrn
  };
});

export { cashflow_get as default };
//# sourceMappingURL=cashflow.get.mjs.map
