import { o as defineEventHandler, O as getUserSession, k as createError, ac as readBody, w as getDb, e as auditLog } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ALLOWED_KEYS = ["tc_purchase_order", "tc_credit_invoice"];
const documents_put = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can update document settings" });
  }
  const body = await readBody(event);
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Invalid body" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const updated = [];
    for (const key of ALLOWED_KEYS) {
      if (key in body && typeof body[key] === "string") {
        await conn.query(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             setting_value = VALUES(setting_value),
             updated_by    = VALUES(updated_by),
             updated_at    = NOW()`,
          [key, body[key], userId]
        );
        updated.push(key);
      }
    }
    if (updated.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "No valid settings keys provided" });
    }
    await auditLog(conn, {
      userId,
      action: "settings_updated",
      module: "admin",
      recordType: "system_settings",
      recordId: 0,
      description: `Document T&C updated by ${role}: ${updated.join(", ")}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, updated };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { documents_put as default };
//# sourceMappingURL=documents.put.mjs.map
