import { s as defineEventHandler, _ as getUserSession, o as createError, aN as resolvePermissions, at as presetBranches, aw as query } from '../../../nitro/nitro.mjs';
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

const permissions_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const userId = session.user.id;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) {
    return { isAdmin: true, permissions: {}, data_scope: "all", allowed_branches: [] };
  }
  const perms = await resolvePermissions(userId, role);
  const { __preset, ...permissions } = perms;
  let data_scope = "branch";
  let allowed_branches = presetBranches(role);
  try {
    const [row] = await query(
      `SELECT data_scope, allowed_branches FROM user_permissions WHERE user_id = ?`,
      [userId]
    );
    if (row) {
      data_scope = (_c = row.data_scope) != null ? _c : "branch";
      try {
        allowed_branches = JSON.parse((_d = row.allowed_branches) != null ? _d : "[]");
      } catch {
        allowed_branches = [];
      }
    }
  } catch {
  }
  return { isAdmin: false, permissions, data_scope, allowed_branches };
});

export { permissions_get as default };
//# sourceMappingURL=permissions.get.mjs.map
