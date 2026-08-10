import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, z as getDb, W as getUserBranchScope, ap as query, a5 as maybeTriggerProductionShortfallAlert } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const requirement_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const q = getQuery(event);
  const date = q.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let scope = null;
  const conn = await getDb().getConnection();
  try {
    scope = await getUserBranchScope(conn, userId, role);
  } finally {
    conn.release();
  }
  const branchId = scope !== null ? scope : q.branch_id ? Number(q.branch_id) : null;
  const branches = await query(
    `SELECT id, name, code FROM branches WHERE branch_type = 'factory' AND status = 'active' ORDER BY name`
  );
  const orderConds = [`o.required_date = ?`, `o.status IN ('approved','in_production')`];
  const orderParams = [date];
  if (branchId !== null) {
    orderConds.push("o.assigned_branch_id = ?");
    orderParams.push(branchId);
  }
  const items = await query(
    `SELECT oi.variant_id, o.assigned_branch_id AS branch_id,
            p.base_name, pv.weight_variant, pv.unit_of_measure,
            oi.quantity AS qty_bags
     FROM credit_order_items oi
     JOIN credit_orders o ON o.id = oi.order_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     LEFT JOIN products p ON p.id = pv.product_id
     WHERE ${orderConds.join(" AND ")} AND oi.variant_id IS NOT NULL AND o.assigned_branch_id IS NOT NULL`,
    orderParams
  );
  const stockConds = [`production_date = ?`];
  const stockParams = [date];
  if (branchId !== null) {
    stockConds.push("branch_id = ?");
    stockParams.push(branchId);
  }
  const stock = await query(
    `SELECT branch_id, variant_id, in_hand_qty, produced_qty
     FROM production_daily_stock
     WHERE ${stockConds.join(" AND ")}`,
    stockParams
  );
  const stockBySlot = /* @__PURE__ */ new Map();
  for (const s of stock) stockBySlot.set(`${s.branch_id}:${s.variant_id}`, s);
  function bagWeightKg(weightVariant, unit) {
    if ((unit || "").toLowerCase() !== "kg") return null;
    const n = parseFloat(weightVariant);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const bySlot = /* @__PURE__ */ new Map();
  for (const it of items) {
    const key = `${it.branch_id}:${it.variant_id}`;
    const entry = (_c = bySlot.get(key)) != null ? _c : {
      branch_id: it.branch_id,
      variant_id: it.variant_id,
      product: `${(_b = it.base_name) != null ? _b : "\u2014"}${it.weight_variant ? " " + it.weight_variant : ""}`,
      bag_kg: bagWeightKg(it.weight_variant, it.unit_of_measure),
      required_bags: 0
    };
    entry.required_bags += Number(it.qty_bags) || 0;
    bySlot.set(key, entry);
  }
  const branchName = new Map(branches.map((b) => [b.id, b.name]));
  const rows = [...bySlot.values()].map((r) => {
    var _a2, _b2, _c2;
    const s = stockBySlot.get(`${r.branch_id}:${r.variant_id}`);
    const inHand = Number((_a2 = s == null ? void 0 : s.in_hand_qty) != null ? _a2 : 0);
    const produced = Number((_b2 = s == null ? void 0 : s.produced_qty) != null ? _b2 : 0);
    const stillNeeded = Math.max(0, r.required_bags - (inHand + produced));
    const round1 = (n) => Math.round(n * 10) / 10;
    return {
      branch_id: r.branch_id,
      branch_name: (_c2 = branchName.get(r.branch_id)) != null ? _c2 : `#${r.branch_id}`,
      variant_id: r.variant_id,
      product: r.product,
      required_bags: round1(r.required_bags),
      in_hand_bags: round1(inHand),
      produced_bags: round1(produced),
      still_needed_bags: round1(stillNeeded),
      required_kg: r.bag_kg ? round1(r.required_bags * r.bag_kg) : null,
      still_needed_kg: r.bag_kg ? round1(stillNeeded * r.bag_kg) : null
    };
  }).sort((a, b) => b.still_needed_bags - a.still_needed_bags);
  maybeTriggerProductionShortfallAlert(date, rows);
  return {
    date,
    branch_id: branchId,
    locked_to_branch: scope !== null,
    branches: scope === null ? branches : [],
    rows
  };
});

export { requirement_get as default };
//# sourceMappingURL=requirement.get.mjs.map
