import { q as defineEventHandler, X as getUserSession, m as createError, au as readBody, ar as query, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
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
function roundDown5(v) {
  return Math.floor(v / 5) * 5;
}
const ADMIN_ROLES = ["admin", "superadmin"];
const ACCOUNTS_ROLES = ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"];
function sumBaseCharges(components, wc) {
  return components.filter((c) => c.is_active && c.charge_type === "base" && (c.weight_class === wc || c.weight_class === "all")).reduce((s, c) => s + Number(c.amount), 0);
}
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
    const { bag_50, bag_74, packaging_fee } = body;
    const cfg = {
      formula: {
        bag_50: Math.max(1, Number(bag_50) || DEFAULT_CONFIG.formula.bag_50),
        bag_74: Math.max(1, Number(bag_74) || DEFAULT_CONFIG.formula.bag_74),
        packaging_fee: Number(packaging_fee != null ? packaging_fee : DEFAULT_CONFIG.formula.packaging_fee)
      }
    };
    await saveConfig(cfg);
    return { ok: true, config: cfg, message: "Formula constants saved." };
  }
  if (action === "save_branch_setup") {
    if (!ADMIN_ROLES.includes(role))
      throw createError({ statusCode: 403, statusMessage: "Admin only" });
    const setups = body.branches;
    if (!Array.isArray(setups) || !setups.length)
      throw createError({ statusCode: 400, statusMessage: "No branches given" });
    const validTypes = ["factory", "sales_region", "office"];
    for (const s of setups) {
      const type = validTypes.includes(s.branch_type) ? s.branch_type : "sales_region";
      const src = type === "sales_region" && s.source_branch_id ? Number(s.source_branch_id) : null;
      await query(
        `UPDATE branches SET branch_type = ?, source_branch_id = ? WHERE id = ?`,
        [type, src, Number(s.id)]
      );
    }
    return { ok: true, message: "Branch setup saved." };
  }
  if (action === "save_components") {
    const branchId = Number(body.branch_id);
    const components = body.components;
    if (!branchId) throw createError({ statusCode: 400, statusMessage: "branch_id required" });
    if (!Array.isArray(components))
      throw createError({ statusCode: 400, statusMessage: "components must be an array" });
    const db = getDb();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`DELETE FROM branch_price_components WHERE branch_id = ?`, [branchId]);
      const rows = components.filter((c) => {
        var _a2;
        return ((_a2 = c.name) != null ? _a2 : "").trim();
      }).map((c, i) => [
        branchId,
        String(c.name).trim().slice(0, 100),
        ["50", "74", "all"].includes(String(c.weight_class)) ? c.weight_class : "all",
        ["base", "mini_truck"].includes(String(c.charge_type)) ? c.charge_type : "base",
        Number(c.amount) || 0,
        c.is_active === 0 ? 0 : 1,
        i
      ]);
      if (rows.length) {
        await conn.query(
          `INSERT INTO branch_price_components
             (branch_id, name, weight_class, charge_type, amount, is_active, sort_order)
           VALUES ?`,
          [rows]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    return { ok: true, message: "Charges saved." };
  }
  if (action === "apply_prices") {
    const base50ByFactory = (_e = body.base50ByFactory) != null ? _e : {};
    const customPrices = (_f = body.customPrices) != null ? _f : {};
    const config = await loadConfig();
    const { bag_50, bag_74, packaging_fee } = config.formula;
    const [branches, allVariants, componentRows] = await Promise.all([
      query(`SELECT id, name, branch_type, source_branch_id FROM branches WHERE status = 'active'`),
      query(`
        SELECT pv.id AS variant_id, pv.grade, pv.weight_variant
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id AND p.status = 'active'
        WHERE pv.status = 'active' AND pv.grade IS NOT NULL AND pv.grade != ''
      `),
      query(`SELECT * FROM branch_price_components WHERE is_active = 1`)
    ]);
    const factories = branches.filter((b) => b.branch_type === "factory");
    const regions = branches.filter((b) => b.branch_type === "sales_region");
    const componentsByBranch = {};
    for (const c of componentRows) {
      if (!componentsByBranch[c.branch_id]) componentsByBranch[c.branch_id] = [];
      componentsByBranch[c.branch_id].push(c);
    }
    const priceRows = [];
    const skippedRegions = regions.filter((r) => !r.source_branch_id || !factories.some((f) => f.id === r.source_branch_id)).map((r) => r.name);
    for (const factory of factories) {
      const bases = base50ByFactory[String(factory.id)];
      if (!bases) continue;
      const factoryRegions = regions.filter((r) => r.source_branch_id === factory.id);
      for (const [grade, base50Raw] of Object.entries(bases)) {
        const base50 = Number(base50Raw);
        if (!base50 || base50 <= 0) continue;
        const base74 = roundDown5(base50 / bag_50 * bag_74 + packaging_fee);
        const gradeVariants = allVariants.filter((v) => v.grade === grade);
        for (const v of gradeVariants) {
          const wc = mapWeight(v.weight_variant);
          if (wc !== "50" && wc !== "74") continue;
          const base = wc === "50" ? base50 : base74;
          const factoryPrice = roundDown5(base + sumBaseCharges((_g = componentsByBranch[factory.id]) != null ? _g : [], wc));
          priceRows.push({
            variant_id: v.variant_id,
            branch_id: factory.id,
            unit_price: factoryPrice,
            note: `Engine \u2014 Grade ${grade} ex-${factory.name}`
          });
          for (const region of factoryRegions) {
            priceRows.push({
              variant_id: v.variant_id,
              branch_id: region.id,
              unit_price: roundDown5(factoryPrice + sumBaseCharges((_h = componentsByBranch[region.id]) != null ? _h : [], wc)),
              note: `Engine \u2014 Grade ${grade} via ${factory.name}`
            });
          }
        }
      }
    }
    for (const [variantIdStr, priceRaw] of Object.entries(customPrices)) {
      const price = roundDown5(Number(priceRaw));
      if (!price || price <= 0) continue;
      const variantId = Number(variantIdStr);
      for (const factory of factories) {
        priceRows.push({ variant_id: variantId, branch_id: factory.id, unit_price: price, note: "Engine \u2014 custom weight" });
      }
      for (const region of regions) {
        if (!region.source_branch_id) continue;
        priceRows.push({
          variant_id: variantId,
          branch_id: region.id,
          unit_price: roundDown5(price + sumBaseCharges((_i = componentsByBranch[region.id]) != null ? _i : [], "custom")),
          note: "Engine \u2014 custom weight"
        });
      }
    }
    if (!priceRows.length)
      return { ok: true, totalUpdated: 0, skippedRegions, message: "No prices to apply." };
    const effDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
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
        return [r.variant_id, r.branch_id, oldPrice, r.unit_price, "engine", changedBy, r.note];
      });
      await conn.query(
        `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by, note) VALUES ?`,
        [logValues]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    return {
      ok: true,
      totalUpdated: priceRows.length,
      skippedRegions,
      message: `Applied \u2014 ${priceRows.length} price records updated.` + (skippedRegions.length ? ` Skipped (no source factory): ${skippedRegions.join(", ")}.` : "")
    };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { pricingEngine_post as default };
//# sourceMappingURL=pricing-engine.post.mjs.map
