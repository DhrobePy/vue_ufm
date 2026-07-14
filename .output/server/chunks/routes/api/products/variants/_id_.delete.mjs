import { n as defineEventHandler, K as getUserSession, j as createError, H as getRouterParam, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
const _id__delete = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid variant ID" });
  const result = await query(
    `UPDATE product_variants SET status = 'inactive' WHERE id = ? AND status = 'active'`,
    [id]
  );
  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: "Variant not found or already inactive" });
  return { ok: true, message: "Variant deactivated" };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
