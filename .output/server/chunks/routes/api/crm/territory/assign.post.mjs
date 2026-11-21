import { Z as defineEventHandler, Q as crmUser, bo as readBody, N as createError, bl as query, bS as scopedHealth, J as clearCrmCache } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const assign_post = defineEventHandler(async (event) => {
  var _a;
  const me = await crmUser(event), b = await readBody(event);
  if (!["admin", "superadmin"].includes(me.role)) throw createError({ statusCode: 403, statusMessage: "Only an administrator can assign territories." });
  const district = String((_a = b == null ? void 0 : b.district) != null ? _a : "").trim();
  if (!district) throw createError({ statusCode: 400, statusMessage: "district is required" });
  const owner = Number(b == null ? void 0 : b.owner_user_id) || null;
  if (owner && !(await query(`SELECT 1 FROM users WHERE id = ? AND status = 'active'`, [owner])).length) throw createError({ statusCode: 400, statusMessage: "Unknown or inactive user" });
  const ids = (await scopedHealth(event)).filter((r) => r.district === district && (!(b == null ? void 0 : b.only_unassigned) || !r.owner_user_id)).map((r) => r.id);
  if (!ids.length) return { ok: true, updated: 0 };
  await query(`UPDATE customers SET owner_user_id = ? WHERE id IN (?)`, [owner, ids]);
  clearCrmCache();
  return { ok: true, updated: ids.length };
});

export { assign_post as default };
//# sourceMappingURL=assign.post.mjs.map
