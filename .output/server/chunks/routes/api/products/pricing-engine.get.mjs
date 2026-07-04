import { m as defineEventHandler, a1 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEFAULT_CONFIG = {
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 }
};
async function loadConfig() {
  var _a, _b;
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`
    );
    if ((_a = rows[0]) == null ? void 0 : _a.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value);
      return { ...DEFAULT_CONFIG, ...parsed, formula: { ...DEFAULT_CONFIG.formula, ...(_b = parsed.formula) != null ? _b : {} } };
    }
  } catch {
  }
  return { ...DEFAULT_CONFIG };
}
const WEIGHT_MAP = {
  "50": "50",
  "74": "74",
  "50KG": "50",
  "74KG": "74",
  "50 KG": "50",
  "74 KG": "74",
  "50kg": "50",
  "74kg": "74"
};
function mapWeight(wv) {
  if (WEIGHT_MAP[wv]) return WEIGHT_MAP[wv];
  for (const [pat, cls] of Object.entries(WEIGHT_MAP)) {
    if (wv.toLowerCase().includes(String(parseInt(pat)).toLowerCase())) return cls;
  }
  return "custom";
}
const pricingEngine_get = defineEventHandler(async () => {
  var _a;
  const config = await loadConfig();
  const [allVariants, currRows, branches, componentRows] = await Promise.all([
    query(`
      SELECT p.id AS product_id, p.base_name AS product_name, p.category,
             pv.id AS variant_id, pv.grade, pv.weight_variant, pv.sku, pv.unit_of_measure,
             MIN(pp.unit_price) AS current_price
      FROM products p
      JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
      LEFT JOIN product_prices pp ON pp.variant_id = pv.id AND pp.is_active = 1
      WHERE p.status = 'active' AND pv.grade IS NOT NULL AND pv.grade != ''
      GROUP BY p.id, pv.id
      ORDER BY pv.grade ASC, pv.weight_variant ASC, p.base_name ASC
    `),
    query(`
      SELECT pv.grade, pp.branch_id, pv.weight_variant, pv.id AS variant_id,
             MIN(pp.unit_price) AS unit_price
      FROM product_prices pp
      JOIN product_variants pv ON pp.variant_id = pv.id
      WHERE pp.is_active = 1 AND pv.grade IS NOT NULL AND pv.grade != '' AND pv.status = 'active'
      GROUP BY pv.grade, pp.branch_id, pv.weight_variant, pv.id
      ORDER BY pv.grade, pp.branch_id
    `),
    query(`
      SELECT id, name, code, branch_type, source_branch_id
      FROM branches WHERE status = 'active' ORDER BY branch_type = 'factory' DESC, id
    `),
    query(`
      SELECT id, branch_id, name, weight_class, charge_type, amount, is_active, sort_order
      FROM branch_price_components
      ORDER BY branch_id, sort_order, id
    `)
  ]);
  const componentsByBranch = {};
  for (const c of componentRows) {
    const key = String(c.branch_id);
    if (!componentsByBranch[key]) componentsByBranch[key] = [];
    componentsByBranch[key].push({ ...c, amount: Number(c.amount) });
  }
  const gradeData = {};
  for (const row of allVariants) {
    const grade = row.grade;
    const wc = mapWeight(row.weight_variant);
    if (!gradeData[grade]) gradeData[grade] = {};
    if (!gradeData[grade][wc]) gradeData[grade][wc] = [];
    gradeData[grade][wc].push({
      product_id: row.product_id,
      product_name: row.product_name,
      category: row.category,
      variant_id: row.variant_id,
      weight_variant: row.weight_variant,
      sku: row.sku,
      uom: row.unit_of_measure,
      current_price: row.current_price !== null ? Number(row.current_price) : null,
      weight_class: wc
    });
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
  const current50ByFactory = {};
  for (const b of branches) {
    if (b.branch_type !== "factory") continue;
    const fid = String(b.id);
    current50ByFactory[fid] = {};
    for (const [g, brs] of Object.entries(currentPrices)) {
      const p = (_a = brs[fid]) == null ? void 0 : _a["50"];
      if (p !== void 0) current50ByFactory[fid][g] = p;
    }
  }
  const grades = Object.keys(gradeData).sort();
  return {
    config,
    grades,
    gradeData,
    currentPrices,
    customCurrent,
    branches,
    componentsByBranch,
    current50ByFactory
  };
});

export { pricingEngine_get as default };
//# sourceMappingURL=pricing-engine.get.mjs.map
