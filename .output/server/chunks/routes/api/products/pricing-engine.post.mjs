import { g as defineEventHandler, G as readBody, d as createError, E as query } from '../../../nitro/nitro.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:url';

const CONFIG_FILE = resolve("server/data/pricing_engine_config.json");
function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
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
  for (const [pat, cls] of Object.entries(WEIGHT_MAP))
    if (wv.toLowerCase().includes(String(parseInt(pat)))) return cls;
  return "custom";
}
const pricingEngine_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "save_config") {
    const { bag_50, bag_74, packaging_fee, branch_surcharges } = body;
    const current = loadConfig();
    const updated = {
      ...current,
      formula: {
        bag_50: Math.max(1, Number(bag_50) || 50),
        bag_74: Math.max(1, Number(bag_74) || 74),
        packaging_fee: (_a = Number(packaging_fee)) != null ? _a : 150
      },
      branch_surcharges: (_b = branch_surcharges != null ? branch_surcharges : current.branch_surcharges) != null ? _b : {}
    };
    writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
    return { ok: true, message: "Formula config saved." };
  }
  if (action === "apply_prices") {
    const { base50ByGrade, customPrices, config } = body;
    if (!(config == null ? void 0 : config.formula))
      throw createError({ statusCode: 400, statusMessage: "Config formula missing" });
    const { bag_50, bag_74, packaging_fee } = config.formula;
    const surcharges = (_c = config.branch_surcharges) != null ? _c : {};
    const effDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const [branches, allVariants] = await Promise.all([
      query(`SELECT id, name FROM branches WHERE status = 'active'`),
      query(`
        SELECT pv.id AS variant_id, pv.grade, pv.weight_variant
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id AND p.status = 'active'
        WHERE pv.status = 'active' AND pv.grade IS NOT NULL AND pv.grade != ''
      `)
    ]);
    let totalUpdated = 0;
    for (const [grade, base50Raw] of Object.entries(base50ByGrade != null ? base50ByGrade : {})) {
      const base50 = Number(base50Raw);
      if (!base50 || base50 <= 0) continue;
      const base74 = Math.round((base50 / bag_50 * bag_74 + packaging_fee) * 100) / 100;
      const gradeVariants = allVariants.filter((v) => v.grade === grade);
      for (const v of gradeVariants) {
        const wc = mapWeight(v.weight_variant);
        if (wc !== "50" && wc !== "74") continue;
        const basePrice = wc === "50" ? base50 : base74;
        for (const b of branches) {
          const sc = surcharges[String(b.id)];
          const surcharge = wc === "50" ? Number((_d = sc == null ? void 0 : sc.surcharge_50) != null ? _d : 0) : Number((_e = sc == null ? void 0 : sc.surcharge_74) != null ? _e : 0);
          const finalPrice = Math.round((basePrice + surcharge) * 100) / 100;
          await query(
            `UPDATE product_prices SET is_active = 0 WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
            [v.variant_id, b.id]
          );
          await query(
            `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
             VALUES (?, ?, ?, ?, 'active', 1)`,
            [v.variant_id, b.id, finalPrice, effDate]
          );
          totalUpdated++;
        }
      }
    }
    for (const [variantIdStr, priceRaw] of Object.entries(customPrices != null ? customPrices : {})) {
      const price = Number(priceRaw);
      if (!price || price <= 0) continue;
      for (const b of branches) {
        await query(
          `UPDATE product_prices SET is_active = 0 WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
          [Number(variantIdStr), b.id]
        );
        await query(
          `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
           VALUES (?, ?, ?, ?, 'active', 1)`,
          [Number(variantIdStr), b.id, price, effDate]
        );
        totalUpdated++;
      }
    }
    return { ok: true, totalUpdated, message: `Applied \u2014 ${totalUpdated} price records updated.` };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { pricingEngine_post as default };
//# sourceMappingURL=pricing-engine.post.mjs.map
