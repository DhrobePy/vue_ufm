import { u as defineEventHandler, a5 as getUserSession, r as createError, U as getQuery, aC as query, b3 as setHeader } from '../../../nitro/nitro.mjs';
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
const export_csv_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const search = String((_a = q.search) != null ? _a : "");
  const type = String((_b = q.type) != null ? _b : "");
  const where = [];
  const params = [];
  if (search) {
    where.push("(c.name LIKE ? OR c.business_name LIKE ? OR c.phone_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type) {
    where.push("c.customer_type = ?");
    params.push(type);
  }
  const rows = await query(
    `SELECT c.id, c.name, c.business_name, c.customer_type, c.phone_number, c.business_address,
            c.credit_limit, c.current_balance, c.status
     FROM customers c
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY c.name
     LIMIT 20000`,
    params
  );
  const header = "ID,Name,Business,Type,Phone,Address,Credit Limit,Outstanding,Status";
  const lines = rows.map((r) => [
    r.id,
    r.name,
    r.business_name,
    r.customer_type,
    r.phone_number,
    r.business_address,
    r.credit_limit,
    r.current_balance,
    r.status
  ].map(csvCell).join(","));
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(event, "Content-Disposition", `attachment; filename="customers-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
  return "\uFEFF" + [header, ...lines].join("\n");
});

export { export_csv_get as default };
//# sourceMappingURL=export.csv.get.mjs.map
