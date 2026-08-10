import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, ap as query, aM as setHeader } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
const payments_csv_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const conds = [];
  const params = [];
  if (q.customer_id) {
    conds.push("p.customer_id = ?");
    params.push(Number(q.customer_id));
  }
  if (q.from) {
    conds.push("p.payment_date >= ?");
    params.push(String(q.from));
  }
  if (q.to) {
    conds.push("p.payment_date <= ?");
    params.push(String(q.to));
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const rows = await query(
    `SELECT p.payment_number, p.payment_date, c.name AS customer, o.order_number,
            p.amount, p.payment_method, p.payment_type, p.reference_number, p.notes,
            u.display_name AS recorded_by
     FROM customer_payments p
     JOIN customers c ON c.id = p.customer_id
     LEFT JOIN credit_orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = p.created_by_user_id
     ${where}
     ORDER BY p.id DESC
     LIMIT 50000`,
    params
  );
  const header = "Payment,Date,Customer,Order,Amount,Method,Type,Reference,Notes,RecordedBy";
  const lines = rows.map((r) => [
    r.payment_number,
    String(r.payment_date).slice(0, 10),
    r.customer,
    r.order_number,
    r.amount,
    r.payment_method,
    r.payment_type,
    r.reference_number,
    r.notes,
    r.recorded_by
  ].map(csvCell).join(","));
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="payments-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
  );
  return "\uFEFF" + [header, ...lines].join("\n");
});

export { payments_csv_get as default };
//# sourceMappingURL=payments.csv.get.mjs.map
