import { Z as defineEventHandler, as as getQuery, aE as getUserSession, aj as getDb, aC as getUserBranchIds, bl as query } from '../../../nitro/nitro.mjs';
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

const returns_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const q = getQuery(event);
  const where = ["1=1"], params = [];
  const status = String((_a = q.status) != null ? _a : "");
  if (["pending", "approved", "rejected"].includes(status)) {
    where.push("r.status = ?");
    params.push(status);
  }
  const ok = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v != null ? v : ""));
  if (ok(q.from)) {
    where.push("r.return_date >= ?");
    params.push(q.from);
  }
  if (ok(q.to)) {
    where.push("r.return_date <= ?");
    params.push(q.to);
  }
  const search = String((_b = q.search) != null ? _b : "").trim();
  if (search) {
    where.push("(r.return_number LIKE ? OR co.order_number LIKE ? OR c.name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const session = await getUserSession(event);
  if (session == null ? void 0 : session.user) {
    const conn = await getDb().getConnection();
    try {
      const scope = await getUserBranchIds(conn, Number(session.user.id), ((_c = session.user.role) != null ? _c : "").toLowerCase());
      if (scope !== null) {
        where.push("co.assigned_branch_id IN (?)");
        params.push(scope.length ? scope : [0]);
      }
    } finally {
      conn.release();
    }
  }
  const rows = await query(
    `SELECT r.id, r.return_number, r.return_date, r.return_type, r.return_reason, r.return_category, r.status, r.notes,
            r.total_returned_qty AS qty, r.total_returned_amount AS amount, r.created_at, r.approved_at,
            co.id AS order_id, co.order_number, c.name AS customer, u.display_name AS created_by, a.display_name AS approved_by
     FROM credit_order_returns r
     JOIN credit_orders co ON co.id = r.order_id JOIN customers c ON c.id = r.customer_id
     LEFT JOIN users u ON u.id = r.created_by_user_id LEFT JOIN users a ON a.id = r.approved_by_user_id
     WHERE ${where.join(" AND ")} ORDER BY r.created_at DESC LIMIT 300`,
    params
  );
  const ids = rows.map((r) => r.id);
  const items = ids.length ? await query(
    `SELECT ri.return_id, p.base_name AS product, COALESCE(pv.weight_variant,'') AS variant, ri.returned_qty AS qty, ri.unit_price AS price, ri.returned_amount AS amount
     FROM credit_order_return_items ri LEFT JOIN products p ON p.id = ri.product_id LEFT JOIN product_variants pv ON pv.id = ri.variant_id WHERE ri.return_id IN (?)`,
    [ids]
  ) : [];
  const by = /* @__PURE__ */ new Map();
  for (const i of items) ((_d = by.get(i.return_id)) != null ? _d : by.set(i.return_id, []).get(i.return_id)).push(i);
  const num = (v) => Number(v != null ? v : 0);
  const list = rows.map((r) => {
    var _a2;
    return { ...r, qty: num(r.qty), amount: num(r.amount), items: ((_a2 = by.get(r.id)) != null ? _a2 : []).map((i) => ({ ...i, qty: num(i.qty), price: num(i.price), amount: num(i.amount) })) };
  });
  const sum = (st) => list.filter((r) => r.status === st).reduce((t, r) => t + r.amount, 0);
  return { returns: list, summary: { pending: { n: list.filter((r) => r.status === "pending").length, v: sum("pending") }, approved: { n: list.filter((r) => r.status === "approved").length, v: sum("approved") }, rejected: { n: list.filter((r) => r.status === "rejected").length, v: sum("rejected") } } };
});

export { returns_get as default };
//# sourceMappingURL=returns.get.mjs.map
