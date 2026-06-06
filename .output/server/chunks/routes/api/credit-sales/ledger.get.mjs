import { h as defineEventHandler, p as getQuery, J as query, K as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ledger_get = defineEventHandler(async (event) => {
  var _a, _b;
  const q = getQuery(event);
  const customerId = q.customer_id ? Number(q.customer_id) : null;
  const dateFrom = q.date_from || null;
  const dateTo = q.date_to || null;
  const where = [];
  const params = [];
  if (customerId) {
    where.push("l.customer_id = ?");
    params.push(customerId);
  }
  if (dateFrom) {
    where.push("l.transaction_date >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push("l.transaction_date <= ?");
    params.push(dateTo);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  let ledger = [];
  let totalDebit = 0;
  let totalCredit = 0;
  try {
    ledger = await query(
      `SELECT l.id, l.transaction_date AS date, l.transaction_type AS type,
              COALESCE(l.invoice_number, l.reference_id) AS ref,
              l.description,
              l.debit_amount AS debit, l.credit_amount AS credit,
              l.balance_after AS balance,
              c.name AS customer_name
       FROM customer_ledger l
       JOIN customers c ON c.id = l.customer_id
       ${w}
       ORDER BY l.transaction_date DESC, l.id DESC
       LIMIT 200`,
      params
    );
    const agg = await queryOne(
      `SELECT COALESCE(SUM(debit_amount),0) AS total_debit,
              COALESCE(SUM(credit_amount),0) AS total_credit
       FROM customer_ledger l ${w}`,
      params
    );
    totalDebit = Number((_a = agg == null ? void 0 : agg.total_debit) != null ? _a : 0);
    totalCredit = Number((_b = agg == null ? void 0 : agg.total_credit) != null ? _b : 0);
  } catch {
    const orderWhere = [];
    const orderParams = [];
    if (customerId) {
      orderWhere.push("o.customer_id = ?");
      orderParams.push(customerId);
    }
    if (dateFrom) {
      orderWhere.push("o.order_date >= ?");
      orderParams.push(dateFrom);
    }
    if (dateTo) {
      orderWhere.push("o.order_date <= ?");
      orderParams.push(dateTo);
    }
    const payWhere = [];
    const payParams = [];
    if (customerId) {
      payWhere.push("p.customer_id = ?");
      payParams.push(customerId);
    }
    if (dateFrom) {
      payWhere.push("p.payment_date >= ?");
      payParams.push(dateFrom);
    }
    if (dateTo) {
      payWhere.push("p.payment_date <= ?");
      payParams.push(dateTo);
    }
    const [orders, payments] = await Promise.all([
      query(
        `SELECT o.id, o.order_date AS date, 'Sale Invoice' AS type,
                o.order_number AS ref,
                CONCAT('Order ', o.order_number) AS description,
                o.total_amount AS debit, 0 AS credit, 0 AS balance,
                c.name AS customer_name
         FROM credit_orders o
         JOIN customers c ON c.id = o.customer_id
         ${orderWhere.length ? "WHERE " + orderWhere.join(" AND ") : ""}
         ORDER BY o.order_date DESC
         LIMIT 100`,
        orderParams
      ),
      query(
        `SELECT p.id, p.payment_date AS date, 'Payment Received' AS type,
                COALESCE(p.reference_number, CONCAT('PMT-',p.id)) AS ref,
                CONCAT('Payment \u2014 ', p.payment_method) AS description,
                0 AS debit, p.amount AS credit, 0 AS balance,
                c.name AS customer_name
         FROM customer_payments p
         JOIN customers c ON c.id = p.customer_id
         ${payWhere.length ? "WHERE " + payWhere.join(" AND ") : ""}
         ORDER BY p.payment_date DESC
         LIMIT 100`,
        payParams
      )
    ]);
    ledger = [...orders, ...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 200);
    let running = 0;
    const reversed = [...ledger].reverse();
    for (const row of reversed) {
      running += Number(row.debit) - Number(row.credit);
      row.balance = running;
    }
    reversed.reverse();
    ledger = reversed;
    totalDebit = orders.reduce((s, r) => s + Number(r.debit), 0);
    totalCredit = payments.reduce((s, r) => s + Number(r.credit), 0);
  }
  const customers = await query(
    `SELECT id, name FROM customers WHERE customer_type = 'Credit' ORDER BY name LIMIT 200`
  );
  return { ledger, totalDebit, totalCredit, balance: totalDebit - totalCredit, customers };
});

export { ledger_get as default };
//# sourceMappingURL=ledger.get.mjs.map
