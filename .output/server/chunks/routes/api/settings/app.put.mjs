import { w as defineEventHandler, a8 as getUserSession, t as createError, aI as readBody, e as APP_SETTING_GROUPS, L as getDb, l as auditLog, aW as resetAppSettingsCache } from '../../../nitro/nitro.mjs';
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

const app_put = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 0);
  if (!["admin", "superadmin"].includes(role)) throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin can change settings" });
  const body = await readBody(event);
  const group = String((_e = body == null ? void 0 : body.group) != null ? _e : "");
  const defaults = APP_SETTING_GROUPS[group];
  if (!defaults) throw createError({ statusCode: 400, statusMessage: "Unknown settings group" });
  const clean = {};
  for (const [k, d] of Object.entries(defaults)) {
    const v = (_f = body == null ? void 0 : body.values) == null ? void 0 : _f[k];
    if (v === void 0) continue;
    if (typeof d === "boolean") clean[k] = Boolean(v);
    else if (typeof d === "number") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: `"${k}" must be a number, zero or more` });
      clean[k] = n;
    } else clean[k] = String(v).trim().slice(0, 500);
  }
  if (group === "company_profile" && clean.name !== void 0 && !clean.name) throw createError({ statusCode: 400, statusMessage: "Company name cannot be empty" });
  if (group === "finance_settings" && clean.fyStart !== void 0 && !(clean.fyStart >= 1 && clean.fyStart <= 12)) throw createError({ statusCode: 400, statusMessage: "Financial year must start in month 1\u201312" });
  if (group === "security_policy" && clean.maxLoginAttempts !== void 0 && clean.maxLoginAttempts < 3) throw createError({ statusCode: 400, statusMessage: "Allow at least 3 login attempts" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[cur]] = await conn.query(`SELECT setting_value FROM system_settings WHERE setting_key = ?`, [group]);
    let merged = { ...defaults, ...(cur == null ? void 0 : cur.setting_value) ? JSON.parse(cur.setting_value) : {}, ...clean };
    const up = (k, v) => conn.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`,
      [k, v, userId]
    );
    await up(group, JSON.stringify(merged));
    if (group === "company_profile") {
      if (clean.tin !== void 0) await up("tax_tin", merged.tin);
      if (clean.bin !== void 0) await up("tax_bin", merged.bin);
      if (clean.name !== void 0) await up("tax_legal_name", merged.name);
      if (clean.address !== void 0) await up("tax_address", merged.address);
    }
    if (group === "finance_settings" && clean.fyStart !== void 0) await up("tax_fiscal_year_start_month", String(merged.fyStart));
    await auditLog(conn, {
      userId,
      action: "settings_updated",
      module: "admin",
      recordType: "system_settings",
      recordId: 0,
      description: `Settings "${group}" changed by ${role}: ${Object.keys(clean).join(", ")}`,
      severity: "info"
    });
    await conn.commit();
    resetAppSettingsCache();
    return { ok: true, group, values: merged };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { app_put as default };
//# sourceMappingURL=app.put.mjs.map
