import { t as defineEventHandler, Y as getRouterParam, a2 as getUserSession, q as createError, N as getQuery, aA as queryOne, az as query } from '../../../../nitro/nitro.mjs';
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

const statement_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const to = iso.test(String(q.to)) ? String(q.to) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const from = iso.test(String(q.from)) ? String(q.from) : `${to.slice(0, 4)}-01-01`;
  const customer = await queryOne(`SELECT id, name, business_name, phone_number, email, business_address, credit_limit, customer_type FROM customers WHERE id = ?`, [id]);
  if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
  const opening = await queryOne(
    `SELECT COALESCE(SUM(debit_amount),0) - COALESCE(SUM(credit_amount),0) b FROM customer_ledger WHERE customer_id = ? AND transaction_date < ?`,
    [id, from]
  );
  const rows = await query(
    `SELECT DATE_FORMAT(l.transaction_date, '%Y-%m-%d') date, l.transaction_type type, COALESCE(l.invoice_number, l.reference_id) ref, l.description,
            l.debit_amount debit, l.credit_amount credit, l.reference_type, l.reference_id, l.review_status, l.review_reason,
            COALESCE(CASE WHEN l.reference_type IN ('credit_order','credit_orders') THEN l.reference_id END, ret.order_id, amd.order_id) linked_order_id
     FROM customer_ledger l
     LEFT JOIN credit_order_returns ret ON l.reference_type IN ('credit_order_return','credit_order_returns') AND ret.id = l.reference_id
     LEFT JOIN order_amendments amd ON l.reference_type IN ('order_amendment','order_amendments') AND amd.id = l.reference_id
     WHERE l.customer_id = ? AND l.transaction_date BETWEEN ? AND ? ORDER BY l.transaction_date, l.id`,
    [id, from, to]
  );
  let running = Number((_b = opening == null ? void 0 : opening.b) != null ? _b : 0);
  const lines = rows.map((r) => ({ ...r, debit: Number(r.debit), credit: Number(r.credit), balance: running += Number(r.debit) - Number(r.credit) }));
  const [openOrders, pendingPayments, reversedPayments] = await Promise.all([
    query(
      `SELECT id, order_number, order_date, status, total_amount, balance_due FROM credit_orders
       WHERE customer_id = ? AND status IN ('pending_approval','escalated','approved','in_production','produced','ready_to_ship') ORDER BY order_date`,
      [id]
    ),
    query(
      `SELECT id, request_type, amount, reference_label, created_at, requested_reason FROM credit_pending_requests
       WHERE customer_id = ? AND status = 'pending' ORDER BY id`,
      [id]
    ).catch(() => []),
    query(
      `SELECT id, payment_number, payment_date, amount, reversed_at, reversal_reason FROM customer_payments
       WHERE customer_id = ? AND reversed_at IS NOT NULL ORDER BY reversed_at`,
      [id]
    )
  ]);
  return {
    openOrders,
    pendingPayments,
    reversedPayments,
    customer,
    from,
    to,
    openingBalance: Number((_c = opening == null ? void 0 : opening.b) != null ? _c : 0),
    lines,
    totalDebit: lines.reduce((s, l) => s + l.debit, 0),
    totalCredit: lines.reduce((s, l) => s + l.credit, 0),
    closingBalance: running
  };
});

export { statement_get as default };
//# sourceMappingURL=statement.get.mjs.map
