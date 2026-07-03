import { j as defineEventHandler, F as getUserSession, f as createError, q as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const permissions_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const userId = session.user.id;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) {
    return { isAdmin: true, permissions: {}, data_scope: "all", allowed_branches: [] };
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    let permissions = {};
    let data_scope = "branch";
    let allowed_branches = [];
    try {
      const [[row]] = await conn.query(
        `SELECT data_scope, allowed_branches, permissions FROM user_permissions WHERE user_id = ?`,
        [userId]
      );
      if (row) {
        data_scope = (_c = row.data_scope) != null ? _c : "branch";
        try {
          allowed_branches = JSON.parse((_d = row.allowed_branches) != null ? _d : "[]");
        } catch {
        }
        try {
          permissions = JSON.parse((_e = row.permissions) != null ? _e : "{}");
        } catch {
        }
      }
    } catch {
    }
    return { isAdmin: false, permissions, data_scope, allowed_branches };
  } finally {
    conn.release();
  }
});

export { permissions_get as default };
//# sourceMappingURL=permissions.get.mjs.map
