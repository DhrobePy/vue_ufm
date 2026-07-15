import { n as defineEventHandler, a7 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEFAULT_CFG = {
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  branch_surcharges: {}
};
async function loadConfig() {
  var _a, _b;
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`
    );
    if ((_a = rows[0]) == null ? void 0 : _a.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value);
      return { ...DEFAULT_CFG, ...parsed, formula: { ...DEFAULT_CFG.formula, ...(_b = parsed.formula) != null ? _b : {} } };
    }
  } catch {
  }
  return { ...DEFAULT_CFG };
}
function mapWeight(wv) {
  const n = parseInt(wv);
  if (n === 50) return "50";
  if (n === 74) return "74";
  return "custom";
}
const hub_get = defineEventHandler(async () => {
  var _a, _b, _c, _d, _e;
  const config = await loadConfig();
  const [products, variants, prices, branches, currRows] = await Promise.all([
    // Base products
    query(`
      SELECT id, base_name, category, description, status
      FROM products
      WHERE status != 'deleted'
      ORDER BY category, base_name
    `),
    // Variants with inventory
    query(`
      SELECT id, product_id, weight_variant, grade, sku,
             weight_kg, unit_of_measure, barcode, status,
             stock_qty, reserved_qty, reorder_level, unit_price AS base_price
      FROM product_variants
      WHERE status = 'active'
      ORDER BY grade, weight_variant
    `),
    // Active prices per variant × branch
    query(`
      SELECT pp.variant_id, pp.branch_id, pp.id AS price_id,
             pp.unit_price, pp.effective_date
      FROM product_prices pp
      WHERE pp.is_active = 1
    `),
    // Branches
    query(`SELECT id, name, code FROM branches WHERE status = 'active' ORDER BY id`),
    // Pricing engine: current prices grouped by grade / branch / weight-class
    query(`
      SELECT pv.grade, pp.branch_id, pv.weight_variant, pv.id AS variant_id,
             MIN(pp.unit_price) AS unit_price
      FROM product_prices pp
      JOIN product_variants pv ON pp.variant_id = pv.id
      WHERE pp.is_active = 1
        AND pv.grade IS NOT NULL AND pv.grade != ''
        AND pv.status = 'active'
      GROUP BY pv.grade, pp.branch_id, pv.weight_variant, pv.id
    `)
  ]);
  for (const b of branches) {
    if (!config.branch_surcharges[b.id])
      config.branch_surcharges[b.id] = { surcharge_50: 0, surcharge_74: 0 };
  }
  const priceMap = /* @__PURE__ */ new Map();
  for (const p of prices) {
    if (!priceMap.has(p.variant_id)) priceMap.set(p.variant_id, {});
    priceMap.get(p.variant_id)[p.branch_id] = {
      unit_price: Number(p.unit_price),
      effective_date: p.effective_date,
      price_id: p.price_id
    };
  }
  const variantsByProduct = /* @__PURE__ */ new Map();
  for (const v of variants) {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
    variantsByProduct.get(v.product_id).push({ ...v, prices: (_a = priceMap.get(v.id)) != null ? _a : {} });
  }
  const productNameMap = /* @__PURE__ */ new Map();
  for (const p of products) productNameMap.set(p.id, p.base_name);
  const gradeData = {};
  const gradedVariants = [];
  for (const v of variants) {
    if (!v.grade) continue;
    gradedVariants.push(v);
    const wc = mapWeight(v.weight_variant);
    if (!gradeData[v.grade]) gradeData[v.grade] = {};
    if (!gradeData[v.grade][wc]) gradeData[v.grade][wc] = [];
    const vPrices = (_b = priceMap.get(v.id)) != null ? _b : {};
    const firstBr = branches[0];
    gradeData[v.grade][wc].push({
      variant_id: v.id,
      product_name: (_c = productNameMap.get(v.product_id)) != null ? _c : "",
      weight_variant: v.weight_variant,
      sku: v.sku,
      uom: v.unit_of_measure,
      current_price: firstBr ? (_e = (_d = vPrices[firstBr.id]) == null ? void 0 : _d.unit_price) != null ? _e : null : null
    });
  }
  const current50 = {};
  for (const cr of currRows) {
    const wc = mapWeight(cr.weight_variant);
    if (wc === "50") {
      if (current50[cr.grade] === void 0 || Number(cr.unit_price) < current50[cr.grade])
        current50[cr.grade] = Number(cr.unit_price);
    }
  }
  const currentPrices = {};
  const customCurrent = {};
  for (const cr of currRows) {
    const g = cr.grade;
    const br = String(cr.branch_id);
    const wc = mapWeight(cr.weight_variant);
    const vid = String(cr.variant_id);
    if (wc === "50" || wc === "74") {
      if (!currentPrices[g]) currentPrices[g] = {};
      if (!currentPrices[g][br]) currentPrices[g][br] = {};
      if (currentPrices[g][br][wc] === void 0)
        currentPrices[g][br][wc] = Number(cr.unit_price);
    } else {
      if (!customCurrent[vid]) customCurrent[vid] = {};
      customCurrent[vid][br] = Number(cr.unit_price);
    }
  }
  const customAll = gradedVariants.filter((v) => mapWeight(v.weight_variant) === "custom").map((v) => {
    var _a2, _b2, _c2, _d2;
    return {
      variant_id: v.id,
      product_name: (_a2 = productNameMap.get(v.product_id)) != null ? _a2 : "",
      weight_variant: v.weight_variant,
      grade: v.grade,
      uom: v.unit_of_measure,
      current_price: branches[0] ? (_d2 = (_c2 = ((_b2 = priceMap.get(v.id)) != null ? _b2 : {})[branches[0].id]) == null ? void 0 : _c2.unit_price) != null ? _d2 : null : null
    };
  });
  const grades = Object.keys(gradeData).sort();
  return {
    products: products.map((p) => {
      var _a2;
      return {
        ...p,
        variants: (_a2 = variantsByProduct.get(p.id)) != null ? _a2 : []
      };
    }),
    branches,
    engine: { config, grades, gradeData, current50, currentPrices, customCurrent, customAll }
  };
});

export { hub_get as default };
//# sourceMappingURL=hub.get.mjs.map
