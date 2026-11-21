import { X as defineEventHandler, am as getQuery, bb as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dailySummary_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
  const ok = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s != null ? s : ""));
  let from = ok(q.date_from) ? String(q.date_from) : today, to = ok(q.date_to) ? String(q.date_to) : today;
  if (from > to) [from, to] = [to, from];
  const P = [from, to];
  const one = async (sql, p = P) => {
    var _a, _b;
    return Number((_b = (_a = (await query(sql, p))[0]) == null ? void 0 : _a.v) != null ? _b : 0);
  };
  const num = (r) => r.map((x) => ({ ...x }));
  const gl = (acct) => `(SELECT COALESCE(SUM(l.debit_amount - l.credit_amount), 0) FROM transaction_lines l WHERE l.account_id = ${acct})`;
  const [banks, petty] = await Promise.all([
    query(`SELECT b.id, b.account_name, b.bank_name, ${gl("b.chart_of_account_id")} AS balance FROM bank_accounts b WHERE b.status = 'active' ORDER BY b.account_name`),
    query(`SELECT p.id, p.account_name, ${gl("p.chart_of_account_id")} AS balance FROM branch_petty_cash_accounts p WHERE p.status = 'active' ORDER BY p.account_name`)
  ]);
  const receivables = await one(`SELECT SUM(balance_due) v FROM credit_orders WHERE balance_due > 0.01 AND status NOT IN ('cancelled','rejected','draft')`, []);
  const live = "AND reversed_at IS NULL";
  const collAdvance = await one(`SELECT SUM(amount) v FROM customer_payments WHERE DATE(payment_date) BETWEEN ? AND ? AND payment_type = 'advance' ${live}`);
  const collDue = await one(`SELECT SUM(amount) v FROM customer_payments WHERE DATE(payment_date) BETWEEN ? AND ? AND payment_type = 'invoice_payment' ${live}`);
  const collections = await query(
    `SELECT cp.payment_number, DATE(cp.payment_date) AS date, c.name AS customer, cp.amount, cp.payment_type AS type, cp.payment_method AS method, COALESCE(ba.account_name, 'Cash') AS account
     FROM customer_payments cp JOIN customers c ON c.id = cp.customer_id LEFT JOIN bank_accounts ba ON ba.id = cp.bank_account_id
     WHERE DATE(cp.payment_date) BETWEEN ? AND ? ${live.replace("reversed_at", "cp.reversed_at")} ORDER BY cp.payment_date DESC, cp.id DESC LIMIT 200`,
    P
  );
  const collCount = await one(`SELECT COUNT(*) v FROM customer_payments WHERE DATE(payment_date) BETWEEN ? AND ? ${live}`);
  const dispatchValue = await one(`SELECT SUM(co.total_amount) v FROM credit_orders co JOIN credit_order_shipping cos ON cos.order_id = co.id WHERE DATE(cos.shipped_date) BETWEEN ? AND ?`);
  const dispatches = await query(
    `SELECT co.order_number, DATE(cos.shipped_date) AS date, c.name AS customer, co.total_amount AS amount, co.status, cos.truck_number AS truck
     FROM credit_orders co JOIN credit_order_shipping cos ON cos.order_id = co.id JOIN customers c ON c.id = co.customer_id
     WHERE DATE(cos.shipped_date) BETWEEN ? AND ? ORDER BY cos.shipped_date DESC LIMIT 200`,
    P
  );
  const purchases = await query(
    `SELECT po_number, po_date AS date, supplier_name AS supplier, quantity_kg AS qty_kg, unit_price_per_kg AS rate, total_order_value AS amount, po_status AS status
     FROM purchase_orders_adnan WHERE DATE(po_date) BETWEEN ? AND ? AND po_status NOT IN ('cancelled','draft') ORDER BY po_date DESC LIMIT 200`,
    P
  );
  const grns = await query(
    `SELECT grn_number, grn_date AS date, supplier_name AS supplier, quantity_received_kg AS qty_kg, unit_price_per_kg AS rate, total_value AS amount
     FROM goods_received_adnan WHERE DATE(grn_date) BETWEEN ? AND ? ORDER BY grn_date DESC LIMIT 200`,
    P
  );
  const supplierPaid = await query(
    `SELECT payment_voucher_number AS payment_number, payment_date AS date, supplier_name AS supplier, amount_paid AS amount, payment_method AS method
     FROM purchase_payments_adnan WHERE DATE(payment_date) BETWEEN ? AND ? AND is_posted = 1 ORDER BY payment_date DESC LIMIT 200`,
    P
  );
  const expenseByCategory = await query(
    `SELECT COALESCE(ec.category_name, 'Uncategorized') AS category, SUM(ev.total_amount) AS amount, COUNT(*) AS vouchers
     FROM expense_vouchers ev LEFT JOIN expense_categories ec ON ec.id = ev.category_id
     WHERE DATE(ev.expense_date) BETWEEN ? AND ? AND ev.status = 'approved' GROUP BY ec.id, ec.category_name ORDER BY amount DESC`,
    P
  );
  const expenses = await query(
    `SELECT ev.voucher_number, ev.expense_date AS date, ec.category_name AS category, ev.handled_by_person AS handled_by, ev.payment_method AS method, ev.total_amount AS amount
     FROM expense_vouchers ev LEFT JOIN expense_categories ec ON ec.id = ev.category_id
     WHERE DATE(ev.expense_date) BETWEEN ? AND ? AND ev.status = 'approved' ORDER BY ev.expense_date DESC, ev.id DESC LIMIT 200`,
    P
  );
  const expTotal = expenseByCategory.reduce((a, r) => a + Number(r.amount), 0);
  const paidTotal = supplierPaid.reduce((a, r) => a + Number(r.amount), 0);
  const inflow = collAdvance + collDue, outflow = paidTotal + expTotal;
  return {
    from,
    to,
    position: { banks: num(banks).map((b) => ({ ...b, balance: Number(b.balance) })), petty: num(petty).map((b) => ({ ...b, balance: Number(b.balance) })), receivables },
    totals: {
      collAdvance,
      collDue,
      collTotal: inflow,
      collCount,
      dispatchValue,
      dispatchCount: dispatches.length,
      poCount: purchases.length,
      poValue: purchases.reduce((a, r) => a + Number(r.amount), 0),
      grnValue: grns.reduce((a, r) => a + Number(r.amount), 0),
      paidTotal,
      expTotal,
      inflow,
      outflow,
      net: inflow - outflow
    },
    collections,
    dispatches,
    purchases,
    grns,
    supplierPaid,
    expenseByCategory,
    expenses
  };
});

export { dailySummary_get as default };
//# sourceMappingURL=daily-summary.get.mjs.map
