import { p as defineEventHandler, V as getUserSession, l as createError, O as getRouterParam, ak as queryOne, aj as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid batch ID" });
  const batch = await queryOne(
    `SELECT b.*, c.name AS customer_name
     FROM recycle_bin_batches b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ?`,
    [id]
  );
  if (!batch) throw createError({ statusCode: 404, statusMessage: "Batch not found" });
  const items = await query(
    `SELECT table_name, op, COUNT(*) AS row_count
     FROM recycle_bin_items WHERE batch_id = ?
     GROUP BY table_name, op
     ORDER BY MIN(id) ASC`,
    [id]
  );
  return { batch, items };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
