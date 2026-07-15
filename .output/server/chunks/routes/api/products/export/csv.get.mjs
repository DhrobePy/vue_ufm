import { o as defineEventHandler, O as getUserSession, k as createError, a9 as query, at as setResponseHeader } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const csv_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id))
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  const rows = await query(`
    SELECT
      p.base_name   AS product,
      p.base_sku    AS base_sku,
      p.category,
      pv.sku        AS variant_sku,
      pv.weight_variant,
      pv.grade,
      pv.unit_of_measure,
      b.name        AS branch,
      b.code        AS branch_code,
      pp.unit_price,
      pp.effective_date,
      pp.status     AS price_status
    FROM product_prices pp
    JOIN product_variants pv ON pv.id = pp.variant_id
    JOIN products          p  ON p.id  = pv.product_id
    JOIN branches          b  ON b.id  = pp.branch_id
    WHERE pp.is_active = 1
      AND pv.status   = 'active'
      AND p.status    = 'active'
    ORDER BY p.base_name, pv.grade, pv.weight_variant, b.name
  `);
  const header = [
    "Product",
    "Base SKU",
    "Category",
    "Variant SKU",
    "Weight/Variant",
    "Grade",
    "UOM",
    "Branch",
    "Branch Code",
    "Unit Price",
    "Effective Date",
    "Price Status"
  ];
  const esc = (v) => {
    const s = String(v != null ? v : "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    header.join(","),
    ...rows.map((r) => [
      esc(r.product),
      esc(r.base_sku),
      esc(r.category),
      esc(r.variant_sku),
      esc(r.weight_variant),
      esc(r.grade),
      esc(r.unit_of_measure),
      esc(r.branch),
      esc(r.branch_code),
      esc(r.unit_price),
      esc(r.effective_date ? String(r.effective_date).slice(0, 10) : ""),
      esc(r.price_status)
    ].join(","))
  ];
  const csv = lines.join("\r\n");
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  setResponseHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setResponseHeader(event, "Content-Disposition", `attachment; filename="prices-${date}.csv"`);
  return csv;
});

export { csv_get as default };
//# sourceMappingURL=csv.get.mjs.map
