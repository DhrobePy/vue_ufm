import { n as defineEventHandler, N as getUserSession, E as getRequestHeader, j as createError, K as getRouterParam, ab as readBody, v as getDb, e as auditLog, R as invalidatePermCache } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const permissions_put = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const actorId = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1;
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can update permissions" });
  }
  const targetId = Number(getRouterParam(event, "id"));
  if (!targetId) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const body = await readBody(event);
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Invalid body" });
  }
  const {
    data_scope = "branch",
    allowed_branches = [],
    permissions = {}
  } = body;
  if (!["all", "branch", "own"].includes(data_scope)) {
    throw createError({ statusCode: 400, statusMessage: "data_scope must be all | branch | own" });
  }
  if (!Array.isArray(allowed_branches)) {
    throw createError({ statusCode: 400, statusMessage: "allowed_branches must be an array" });
  }
  if (typeof permissions !== "object") {
    throw createError({ statusCode: 400, statusMessage: "permissions must be an object" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      user_id          BIGINT UNSIGNED NOT NULL PRIMARY KEY,
      data_scope       VARCHAR(20)     NOT NULL DEFAULT 'branch',
      allowed_branches LONGTEXT        NULL,
      permissions      LONGTEXT        NOT NULL,
      updated_by       BIGINT UNSIGNED NULL,
      updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).catch(() => {
  });
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query(
      `SELECT id, display_name, role FROM users WHERE id = ?`,
      [targetId]
    );
    if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
    await conn.query(
      `INSERT INTO user_permissions
         (user_id, data_scope, allowed_branches, permissions, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         data_scope       = VALUES(data_scope),
         allowed_branches = VALUES(allowed_branches),
         permissions      = VALUES(permissions),
         updated_by       = VALUES(updated_by),
         updated_at       = NOW()`,
      [
        targetId,
        data_scope,
        JSON.stringify(allowed_branches),
        JSON.stringify(permissions),
        actorId
      ]
    );
    const enabledModules = Object.entries(permissions).filter(([, v]) => v == null ? void 0 : v.enabled).map(([k]) => k);
    await auditLog(conn, {
      userId: actorId,
      action: "permissions_updated",
      module: "admin",
      recordType: "user_permissions",
      recordId: targetId,
      description: `Permissions updated for user "${user.display_name}" (${user.role}) \u2014 scope: ${data_scope} \u2014 ${enabledModules.length} modules enabled`,
      severity: "warning",
      ipAddress
    });
    await conn.commit();
    invalidatePermCache(targetId);
    return { ok: true, user_id: targetId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { permissions_put as default };
//# sourceMappingURL=permissions.put.mjs.map
