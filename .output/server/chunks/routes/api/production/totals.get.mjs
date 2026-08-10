import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const totals_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const q = getQuery(event);
  const from = q.from || new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const to = q.to || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const batches = await query(
    `SELECT ps.id, ps.order_id, ps.scheduled_date, ps.production_completed_at,
            ps.bags_completed, ps.target_bags, ps.status
     FROM production_schedule ps
     WHERE COALESCE(DATE(ps.production_completed_at), ps.scheduled_date) BETWEEN ? AND ?
       AND ps.bags_completed > 0
     ORDER BY COALESCE(DATE(ps.production_completed_at), ps.scheduled_date)`,
    [from, to]
  );
  if (!batches.length) return { by_date: [], by_product: [], from, to };
  const orderIds = [...new Set(batches.map((b) => b.order_id))];
  const items = orderIds.length ? await query(
    `SELECT oi.order_id, oi.quantity AS qty_bags,
                p.base_name, pv.weight_variant, pv.unit_of_measure
         FROM credit_order_items oi
         JOIN product_variants pv ON pv.id = oi.variant_id
         JOIN products p ON p.id = pv.product_id
         WHERE oi.order_id IN (?)`,
    [orderIds]
  ) : [];
  const itemsByOrder = /* @__PURE__ */ new Map();
  for (const it of items) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
    itemsByOrder.get(it.order_id).push(it);
  }
  function bagWeightKg(weightVariant, unit) {
    if ((unit || "").toLowerCase() !== "kg") return null;
    const n = parseFloat(weightVariant);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const byDate = /* @__PURE__ */ new Map();
  const byProduct = /* @__PURE__ */ new Map();
  for (const b of batches) {
    const date = String(b.production_completed_at ? String(b.production_completed_at).slice(0, 10) : b.scheduled_date).slice(0, 10);
    const target = Number(b.target_bags) || 0;
    const completed = Number(b.bags_completed) || 0;
    const ratio = target > 0 ? Math.min(1, completed / target) : 1;
    const orderItems = (_a = itemsByOrder.get(b.order_id)) != null ? _a : [];
    if (!orderItems.length) continue;
    for (const it of orderItems) {
      const bagKg = bagWeightKg(it.weight_variant, it.unit_of_measure);
      const bags = Number(it.qty_bags) * ratio;
      const kg = bagKg ? bags * bagKg : 0;
      const dEntry = (_b = byDate.get(date)) != null ? _b : { bags: 0, kg: 0 };
      dEntry.bags += bags;
      dEntry.kg += kg;
      byDate.set(date, dEntry);
      const productLabel = `${it.base_name}${it.weight_variant ? " " + it.weight_variant : ""}`;
      const pEntry = (_c = byProduct.get(productLabel)) != null ? _c : { bags: 0, kg: 0 };
      pEntry.bags += bags;
      pEntry.kg += kg;
      byProduct.set(productLabel, pEntry);
    }
  }
  const round1 = (n) => Math.round(n * 10) / 10;
  return {
    from,
    to,
    by_date: [...byDate.entries()].map(([date, v]) => ({ date, bags: round1(v.bags), kg: round1(v.kg) })).sort((a, b) => a.date.localeCompare(b.date)),
    by_product: [...byProduct.entries()].map(([product, v]) => ({ product, bags: round1(v.bags), kg: round1(v.kg) })).sort((a, b) => b.bags - a.bags)
  };
});

export { totals_get as default };
//# sourceMappingURL=totals.get.mjs.map
