import { q as defineEventHandler, J as getQuery, an as query, a9 as paginate } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const grn_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const q = getQuery(event);
  const search = q.search || "";
  const date_from = q.date_from || "";
  const date_to = q.date_to || "";
  const supplier_id = q.supplier_id || "";
  const wheat_origin = q.wheat_origin || "";
  const grn_status = q.grn_status || "";
  const unload_point = q.unload_point || "";
  const truck_number = q.truck_number || "";
  const page = Number(q.page) || 1;
  const per = Math.min(Number(q.per) || 50, 500);
  const { limit, offset } = paginate(page, per);
  const where = [];
  const params = [];
  if (date_from) {
    where.push("g.grn_date >= ?");
    params.push(date_from);
  }
  if (date_to) {
    where.push("g.grn_date <= ?");
    params.push(date_to);
  }
  if (supplier_id) {
    where.push("g.supplier_id = ?");
    params.push(supplier_id);
  }
  if (wheat_origin) {
    where.push("po.wheat_origin = ?");
    params.push(wheat_origin);
  }
  if (grn_status) {
    where.push("g.grn_status = ?");
    params.push(grn_status);
  }
  if (unload_point) {
    where.push("g.unload_point_name = ?");
    params.push(unload_point);
  }
  if (truck_number) {
    where.push("g.truck_number LIKE ?");
    params.push(`%${truck_number}%`);
  }
  if (search) {
    where.push("(g.grn_number LIKE ? OR g.po_number LIKE ? OR g.truck_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [grns, statsRows, countRows] = await Promise.all([
    query(
      `SELECT g.id, g.grn_number, g.grn_date, g.po_number, g.supplier_name,
              g.quantity_received_kg, g.expected_quantity,
              g.unit_price_per_kg, g.total_value,
              g.variance_percentage, g.grn_status,
              g.truck_number, g.unload_point_name,
              po.wheat_origin,
              b.name AS unload_branch_name
       FROM goods_received_adnan g
       LEFT JOIN purchase_orders_adnan po ON po.id = g.purchase_order_id
       LEFT JOIN branches b ON b.id = g.unload_point_branch_id
       ${w}
       ORDER BY g.grn_date DESC, g.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(
      `SELECT
         COUNT(*) AS total_grns,
         COALESCE(SUM(g.expected_quantity), 0)      AS total_expected_qty,
         COALESCE(SUM(g.quantity_received_kg), 0)   AS total_received_qty,
         COALESCE(SUM(g.total_value), 0)            AS total_value,
         SUM(CASE WHEN g.grn_status='posted'    THEN 1 ELSE 0 END) AS posted_count,
         SUM(CASE WHEN g.grn_status='verified'  THEN 1 ELSE 0 END) AS verified_count,
         SUM(CASE WHEN g.grn_status='draft'     THEN 1 ELSE 0 END) AS draft_count,
         SUM(CASE WHEN g.grn_status='cancelled' THEN 1 ELSE 0 END) AS cancelled_count
       FROM goods_received_adnan g
       LEFT JOIN purchase_orders_adnan po ON po.id = g.purchase_order_id
       ${w}`,
      params
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM goods_received_adnan g
       LEFT JOIN purchase_orders_adnan po ON po.id = g.purchase_order_id
       ${w}`,
      params
    )
  ]);
  const [suppliers, origins, unloadPoints] = await Promise.all([
    query(
      `SELECT DISTINCT s.id, s.company_name
       FROM suppliers s
       INNER JOIN goods_received_adnan g ON g.supplier_id = s.id
       ORDER BY s.company_name`,
      []
    ),
    query(
      `SELECT DISTINCT po.wheat_origin
       FROM purchase_orders_adnan po
       INNER JOIN goods_received_adnan g ON g.purchase_order_id = po.id
       WHERE po.wheat_origin IS NOT NULL
       ORDER BY po.wheat_origin`,
      []
    ),
    query(
      `SELECT DISTINCT unload_point_name
       FROM goods_received_adnan
       WHERE unload_point_name IS NOT NULL
       ORDER BY unload_point_name`,
      []
    )
  ]);
  const stats = (_a = statsRows[0]) != null ? _a : {};
  stats.total_variance_qty = Number(stats.total_expected_qty) - Number(stats.total_received_qty);
  return {
    grns,
    total: (_c = (_b = countRows[0]) == null ? void 0 : _b.total) != null ? _c : 0,
    stats,
    page,
    perPage: per,
    suppliers,
    origins,
    unloadPoints
  };
});

export { grn_get as default };
//# sourceMappingURL=grn.get.mjs.map
