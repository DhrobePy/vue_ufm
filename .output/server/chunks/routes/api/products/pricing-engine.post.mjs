import { h as defineEventHandler, x as getUserSession, e as createError, M as readBody, K as query, n as getDb } from '../../../nitro/nitro.mjs';
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
  formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 }};
async function loadConfig() {
  var _a;
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`
    );
    if ((_a = rows[0]) == null ? void 0 : _a.setting_value) return JSON.parse(rows[0].setting_value);
  } catch {
  }
  return {};
}
async function saveConfig(cfg) {
  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('pricing_engine_config', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(cfg)]
  );
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
const ACCOUNTS_ROLES = ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"];
const pricingEngine_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ACCOUNTS_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const changedBy = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "save_config") {
    const { bag_50, bag_74, packaging_fee, branch_surcharges } = body;
    const current = await loadConfig();
    const updated = {
      ...current,
      formula: {
        bag_50: Math.max(1, Number(bag_50) || DEFAULT_CONFIG.formula.bag_50),
        bag_74: Math.max(1, Number(bag_74) || DEFAULT_CONFIG.formula.bag_74),
        packaging_fee: (_e = Number(packaging_fee)) != null ? _e : DEFAULT_CONFIG.formula.packaging_fee
      },
      branch_surcharges: (_f = branch_surcharges != null ? branch_surcharges : current.branch_surcharges) != null ? _f : {}
    };
    await saveConfig(updated);
    return { ok: true, message: "Formula config saved." };
  }
  if (action === "apply_prices") {
    const { base50ByGrade, customPrices, config } = body;
    if (!(config == null ? void 0 : config.formula))
      throw createError({ statusCode: 400, statusMessage: "Config formula missing" });
    const { bag_50, bag_74, packaging_fee } = config.formula;
    const surcharges = (_g = config.branch_surcharges) != null ? _g : {};
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
    const priceRows = [];
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
          const surcharge = wc === "50" ? Number((_h = sc == null ? void 0 : sc.surcharge_50) != null ? _h : 0) : Number((_i = sc == null ? void 0 : sc.surcharge_74) != null ? _i : 0);
          priceRows.push({
            variant_id: v.variant_id,
            branch_id: b.id,
            unit_price: Math.round((basePrice + surcharge) * 100) / 100
          });
        }
      }
    }
    for (const [variantIdStr, priceRaw] of Object.entries(customPrices != null ? customPrices : {})) {
      const price = Number(priceRaw);
      if (!price || price <= 0) continue;
      for (const b of branches) {
        priceRows.push({ variant_id: Number(variantIdStr), branch_id: b.id, unit_price: price });
      }
    }
    if (!priceRows.length)
      return { ok: true, totalUpdated: 0, message: "No prices to apply." };
    const affectedVariantIds = [...new Set(priceRows.map((r) => r.variant_id))];
    const db = getDb();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const placeholders = affectedVariantIds.map(() => "?").join(",");
      const [oldPrices] = await conn.query(
        `SELECT variant_id, branch_id, unit_price FROM product_prices
         WHERE variant_id IN (${placeholders}) AND is_active = 1`,
        affectedVariantIds
      );
      const oldPriceMap = /* @__PURE__ */ new Map();
      for (const row of oldPrices) {
        oldPriceMap.set(`${row.variant_id}:${row.branch_id}`, Number(row.unit_price));
      }
      await conn.query(
        `UPDATE product_prices SET is_active = 0 WHERE variant_id IN (${placeholders}) AND is_active = 1`,
        affectedVariantIds
      );
      const values = priceRows.map((r) => [r.variant_id, r.branch_id, r.unit_price, effDate, 1]);
      await conn.query(
        `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, is_active) VALUES ?`,
        [values]
      );
      const logValues = priceRows.map((r) => {
        var _a2;
        const oldPrice = (_a2 = oldPriceMap.get(`${r.variant_id}:${r.branch_id}`)) != null ? _a2 : null;
        const changeType = oldPrice !== null ? "update" : "set";
        return [r.variant_id, r.branch_id, oldPrice, r.unit_price, changeType, changedBy];
      });
      if (logValues.length) {
        await conn.query(
          `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by) VALUES ?`,
          [logValues]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    return { ok: true, totalUpdated: priceRows.length, message: `Applied \u2014 ${priceRows.length} price records updated.` };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { pricingEngine_post as default };
//# sourceMappingURL=pricing-engine.post.mjs.map
