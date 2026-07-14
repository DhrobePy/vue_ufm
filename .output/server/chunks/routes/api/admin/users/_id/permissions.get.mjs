import { n as defineEventHandler, L as getUserSession, j as createError, I as getRouterParam, u as getDb } from '../../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can view permissions" });
  }
  const targetId = Number(getRouterParam(event, "id"));
  if (!targetId) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    const [[user]] = await conn.query(
      `SELECT id, display_name, email, role, status, last_login FROM users WHERE id = ?`,
      [targetId]
    );
    if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
    let data_scope = user.role === "superadmin" || user.role === "admin" ? "all" : "branch";
    let allowed_branches = ["srg"];
    let permissions = {};
    try {
      const [[saved]] = await conn.query(
        `SELECT data_scope, allowed_branches, permissions FROM user_permissions WHERE user_id = ?`,
        [targetId]
      );
      if (saved) {
        data_scope = (_c = saved.data_scope) != null ? _c : data_scope;
        try {
          allowed_branches = (_e = JSON.parse((_d = saved.allowed_branches) != null ? _d : "[]")) != null ? _e : [];
        } catch {
        }
        try {
          permissions = (_g = JSON.parse((_f = saved.permissions) != null ? _f : "{}")) != null ? _g : {};
        } catch {
        }
      }
    } catch {
    }
    return {
      user: {
        id: user.id,
        name: user.display_name,
        email: user.email,
        role: user.role,
        status: user.status,
        last_login: user.last_login
      },
      data_scope,
      allowed_branches,
      permissions
    };
  } finally {
    conn.release();
  }
});

export { permissions_get as default };
//# sourceMappingURL=permissions.get.mjs.map
