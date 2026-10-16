import { t as defineEventHandler, a2 as getUserSession, p as createError, N as getQuery, az as query, a_ as setHeader, R as RUNNING_BALANCE_SQL } from '../../../../nitro/nitro.mjs';
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

function csvCell(v) {
  const s = v === null || v === void 0 ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const ledger_csv_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const inner = q.customer_id ? "WHERE l.customer_id = ?" : "";
  const outer = [];
  const params = q.customer_id ? [Number(q.customer_id)] : [];
  if (q.from) {
    outer.push("t.d >= ?");
    params.push(String(q.from));
  }
  if (q.to) {
    outer.push("t.d <= ?");
    params.push(String(q.to));
  }
  const rows = await query(
    `SELECT * FROM (
       SELECT DATE_FORMAT(l.transaction_date, '%Y-%m-%d') AS d, l.id, l.customer_id, c.name AS customer, l.transaction_type, l.invoice_number,
              l.description, l.debit_amount, l.credit_amount, ${RUNNING_BALANCE_SQL} AS balance
       FROM customer_ledger l JOIN customers c ON c.id = l.customer_id
       ${inner}
     ) t ${outer.length ? "WHERE " + outer.join(" AND ") : ""}
     ORDER BY t.customer_id, t.d, t.id
     LIMIT 50000`,
    params
  );
  const header = "Date,Customer,Type,Reference,Description,Debit,Credit,Balance";
  const lines = rows.map((r) => [
    r.d,
    r.customer,
    r.transaction_type,
    r.invoice_number,
    r.description,
    r.debit_amount,
    r.credit_amount,
    r.balance
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
