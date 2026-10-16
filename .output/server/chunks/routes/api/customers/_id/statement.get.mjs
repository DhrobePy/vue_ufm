import { t as defineEventHandler, X as getRouterParam, a1 as getUserSession, p as createError, N as getQuery, az as queryOne, ay as query } from '../../../../nitro/nitro.mjs';
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
    `SELECT transaction_date date, transaction_type type, COALESCE(invoice_number, reference_id) ref, description,
            debit_amount debit, credit_amount credit
     FROM customer_ledger WHERE customer_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date, id`,
    [id, from, to]
  );
  let running = Number((_b = opening == null ? void 0 : opening.b) != null ? _b : 0);
  const lines = rows.map((r) => ({ ...r, debit: Number(r.debit), credit: Number(r.credit), balance: running += Number(r.debit) - Number(r.credit) }));
  return {
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
