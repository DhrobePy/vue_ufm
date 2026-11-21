import { Z as defineEventHandler, Q as crmUser, bo as readBody, b2 as phone9, N as createError, bl as query } from '../../../../nitro/nitro.mjs';
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

const optout_post = defineEventHandler(async (event) => {
  var _a;
  const me = await crmUser(event), b = await readBody(event), p9 = phone9(b == null ? void 0 : b.phone);
  if (p9.length < 8) throw createError({ statusCode: 400, statusMessage: "Phone number needed" });
  if ((b == null ? void 0 : b.optout) === false) {
    if (!["admin", "superadmin"].includes(me.role)) throw createError({ statusCode: 403, statusMessage: "Only an administrator can remove a number from the do-not-contact list." });
    await query(`DELETE FROM crm_optout WHERE phone9 = ?`, [p9]);
  } else await query(`INSERT IGNORE INTO crm_optout (phone9, reason) VALUES (?, ?)`, [p9, String((_a = b == null ? void 0 : b.reason) != null ? _a : `added by ${me.name}`).slice(0, 200)]);
  return { ok: true };
});

export { optout_post as default };
//# sourceMappingURL=optout.post.mjs.map
