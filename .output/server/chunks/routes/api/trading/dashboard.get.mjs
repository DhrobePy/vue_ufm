import { p as defineEventHandler, V as getUserSession, l as createError, H as getQuery, ak as queryOne, aj as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const dashboard_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const q = getQuery(event);
  const now = /* @__PURE__ */ new Date();
  const from = String(q.date_from || `${now.toISOString().slice(0, 7)}-01`);
  const to = String(q.date_to || now.toISOString().slice(0, 10));
  const buildExtra = (prefix) => {
    const where = [];
    const params = [];
    if (q.customer_id) {
      where.push(`${prefix}customer_id = ?`);
      params.push(Number(q.customer_id));
    }
    if (q.commodity_id) {
      where.push(`${prefix}commodity_id = ?`);
      params.push(Number(q.commodity_id));
    }
    if (q.origin) {
      where.push(`${prefix}origin = ?`);
      params.push(String(q.origin));
    }
    return { sql: where.length ? ` AND ${where.join(" AND ")}` : "", params };
  };
  const kpiExtra = buildExtra("");
  const collectedExtra = buildExtra("s.");
  const [kpis, collected, inventory, outstanding, settlements] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS sales_count,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(cogs_amount), 0)  AS cogs
       FROM commodity_sales
       WHERE status = 'posted' AND sale_date BETWEEN ? AND ?${kpiExtra.sql}`,
      [from, to, ...kpiExtra.params]
    ),
    queryOne(
      `SELECT COALESCE(SUM(csp.amount), 0) AS collected
       FROM commodity_sale_payments csp
       JOIN commodity_sales s ON s.id = csp.sale_id
       WHERE csp.payment_date BETWEEN ? AND ?${collectedExtra.sql}`,
      [from, to, ...collectedExtra.params]
    ),
    query(
      `SELECT ci.*, pc.name AS commodity_name, pc.unit, b.name AS branch_name
       FROM commodity_inventory ci
       JOIN purchase_commodities pc ON pc.id = ci.commodity_id
       LEFT JOIN branches b ON b.id = ci.branch_id
       WHERE ci.qty_on_hand <> 0
       ORDER BY pc.name, b.name, ci.origin`
    ),
    queryOne(
      `SELECT COALESCE(SUM(balance_due), 0) AS due
       FROM commodity_sales WHERE status = 'posted' AND balance_due > 0`
    ),
    query(
      `SELECT s.*, bp.name AS partner_name FROM business_partner_settlements s
       JOIN business_partners bp ON bp.id = s.partner_id
       ORDER BY s.id DESC LIMIT 10`
    )
  ]);
  const revenue = Number((_a = kpis == null ? void 0 : kpis.revenue) != null ? _a : 0);
  const cogs = Number((_b = kpis == null ? void 0 : kpis.cogs) != null ? _b : 0);
  const inventoryValue = inventory.reduce(
    (s, r) => s + Math.max(0, Number(r.qty_on_hand)) * Number(r.weighted_avg_cost),
    0
  );
  const negativeStock = inventory.filter((r) => Number(r.qty_on_hand) < 0);
  return {
    period: { from, to },
    kpis: {
      sales_count: Number((_c = kpis == null ? void 0 : kpis.sales_count) != null ? _c : 0),
      revenue,
      cogs,
      margin: revenue - cogs,
      margin_pct: revenue > 0 ? Math.round((revenue - cogs) / revenue * 1e3) / 10 : 0,
      collected: Number((_d = collected == null ? void 0 : collected.collected) != null ? _d : 0),
      outstanding: Number((_e = outstanding == null ? void 0 : outstanding.due) != null ? _e : 0),
      inventory_value: Math.round(inventoryValue * 100) / 100
    },
    inventory,
    negative_stock: negativeStock,
    settlements
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
