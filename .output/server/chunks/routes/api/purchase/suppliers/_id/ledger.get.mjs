import { q as defineEventHandler, R as getRouterParam, m as createError, J as getQuery, aq as queryOne, ap as query } from '../../../../../nitro/nitro.mjs';
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

async function safeQuery(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
const ledger_get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid supplier ID" });
  const q = getQuery(event);
  const dateFrom = q.date_from || "";
  const dateTo = q.date_to || "";
  const supplier = await queryOne(
    `SELECT id, company_name, contact_person, phone, address, current_balance, credit_limit
     FROM suppliers WHERE id = ?`,
    [id]
  );
  if (!supplier) {
    throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
  }
  const dateWhere = [`sl.supplier_id = ?`];
  const dateParams = [id];
  if (dateFrom) {
    dateWhere.push("sl.transaction_date >= ?");
    dateParams.push(dateFrom);
  }
  if (dateTo) {
    dateWhere.push("sl.transaction_date <= ?");
    dateParams.push(dateTo);
  }
  const dw = "WHERE " + dateWhere.join(" AND ");
  const [ledgerRows, ledgerStats] = await Promise.all([
    safeQuery(() => query(
      `SELECT sl.id, sl.transaction_date AS date, sl.transaction_type AS type,
              sl.description, sl.reference_number AS ref,
              sl.debit_amount AS debit, sl.credit_amount AS credit, sl.balance
       FROM supplier_ledger sl
       ${dw}
       ORDER BY sl.transaction_date ASC, sl.id ASC
       LIMIT 300`,
      dateParams
    ), []),
    safeQuery(() => queryOne(
      `SELECT
         COALESCE(SUM(credit_amount), 0) AS total_purchased,
         COALESCE(SUM(debit_amount),  0) AS total_paid
       FROM supplier_ledger sl ${dw}`,
      dateParams
    ), null)
  ]);
  if (ledgerRows.length > 0 && ledgerStats) {
    return { supplier, ledger: ledgerRows, stats: ledgerStats };
  }
  const dateOrderWhere = ["o.supplier_id = ?"];
  const dateOrderParams = [id];
  const datePayWhere = ["p.supplier_id = ?"];
  const datePayParams = [id];
  if (dateFrom) {
    dateOrderWhere.push("o.po_date >= ?");
    dateOrderParams.push(dateFrom);
    datePayWhere.push("p.payment_date >= ?");
    datePayParams.push(dateFrom);
  }
  if (dateTo) {
    dateOrderWhere.push("o.po_date <= ?");
    dateOrderParams.push(dateTo);
    datePayWhere.push("p.payment_date <= ?");
    datePayParams.push(dateTo);
  }
  const [orders, payments] = await Promise.all([
    safeQuery(() => query(
      `SELECT o.id, o.po_date AS date,
              CONCAT('Purchase Order: ', o.po_number) AS description,
              o.po_number AS ref,
              o.total_order_value AS credit, 0 AS debit
       FROM purchase_orders_adnan o
       WHERE ${dateOrderWhere.join(" AND ")}
       ORDER BY o.po_date ASC LIMIT 200`,
      dateOrderParams
    ), []),
    safeQuery(() => query(
      `SELECT p.id, p.payment_date AS date,
              CASE
                WHEN p.payment_type = 'contra'           THEN CONCAT('Contra Offset \u2014 ', COALESCE(p.reference_number, p.payment_voucher_number))
                WHEN p.payment_type = 'advance'          THEN CONCAT('Advance Payment \u2014 ', p.payment_voucher_number)
                WHEN p.payment_type = 'against_delivery' THEN CONCAT('Delivery Expense \u2014 ', p.payment_voucher_number)
                ELSE CONCAT('Payment \u2014 ', p.payment_method)
              END AS description,
              COALESCE(p.payment_voucher_number, CONCAT('PMT-', p.id)) AS ref,
              0 AS credit,
              COALESCE(p.amount_paid, 0) AS debit
       FROM purchase_payments_adnan p
       WHERE ${datePayWhere.join(" AND ")}
       ORDER BY p.payment_date ASC LIMIT 200`,
      datePayParams
    ), [])
  ]);
  const combined = [...orders, ...payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let running = 0;
  for (const row of combined) {
    running += Number(row.credit) - Number(row.debit);
    row.balance = running;
  }
  return {
    supplier,
    ledger: combined,
    stats: {
      total_purchased: orders.reduce((s, o) => {
        var _a;
        return s + Number((_a = o.credit) != null ? _a : 0);
      }, 0),
      total_paid: payments.reduce((s, p) => {
        var _a;
        return s + Number((_a = p.debit) != null ? _a : 0);
      }, 0)
    }
  };
});

export { ledger_get as default };
//# sourceMappingURL=ledger.get.mjs.map
