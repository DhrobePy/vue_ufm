import { q as defineEventHandler, X as getUserSession, m as createError, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const recycleBin_get = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  const q = getQuery(event);
  const status = q.status ? String(q.status) : "active";
  const batches = await query(
    `SELECT b.*, c.name AS customer_name
     FROM recycle_bin_batches b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE (? = '' OR b.status = ?)
     ORDER BY b.deleted_at DESC
     LIMIT 300`,
    [status, status]
  );
  return { batches };
});

export { recycleBin_get as default };
//# sourceMappingURL=recycle-bin.get.mjs.map
