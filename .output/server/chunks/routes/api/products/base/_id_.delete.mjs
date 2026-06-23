import { h as defineEventHandler, x as getUserSession, e as createError, w as getRouterParam, K as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ADMIN_ROLES = ["admin", "superadmin"];
const _id__delete = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid product ID" });
  const result = await query(
    `UPDATE products SET status = 'deleted' WHERE id = ? AND status != 'deleted'`,
    [id]
  );
  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  return { ok: true, message: "Product deleted" };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
