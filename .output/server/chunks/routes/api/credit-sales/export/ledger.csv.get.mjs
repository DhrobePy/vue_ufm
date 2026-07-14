import { n as defineEventHandler, L as getUserSession, j as createError, z as getQuery, a6 as query, ah as setHeader } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

function csvCell(v) {
  const s = v === null || v === void 0 ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const ledger_csv_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const conds = [];
  const params = [];
  if (q.customer_id) {
    conds.push("l.customer_id = ?");
    params.push(Number(q.customer_id));
  }
  if (q.from) {
    conds.push("l.transaction_date >= ?");
    params.push(String(q.from));
  }
  if (q.to) {
    conds.push("l.transaction_date <= ?");
    params.push(String(q.to));
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const rows = await query(
    `SELECT l.transaction_date, c.name AS customer, l.transaction_type, l.invoice_number,
            l.description, l.debit_amount, l.credit_amount, l.balance_after
     FROM customer_ledger l
     JOIN customers c ON c.id = l.customer_id
     ${where}
     ORDER BY l.customer_id, l.transaction_date, l.id
     LIMIT 50000`,
    params
  );
  const header = "Date,Customer,Type,Reference,Description,Debit,Credit,Balance";
  const lines = rows.map((r) => [
    String(r.transaction_date).slice(0, 10),
    r.customer,
    r.transaction_type,
    r.invoice_number,
    r.description,
    r.debit_amount,
    r.credit_amount,
    r.balance_after
  ].map(csvCell).join(","));
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="customer-ledger-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
  );
  return "\uFEFF" + [header, ...lines].join("\n");
});

export { ledger_csv_get as default };
//# sourceMappingURL=ledger.csv.get.mjs.map
