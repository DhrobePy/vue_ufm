import { Z as defineEventHandler, c3 as useRuntimeConfig, as as getQuery, N as createError, bW as sendTelegram } from '../../../nitro/nitro.mjs';
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

const backupAlert_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const secret = String((_a = useRuntimeConfig().cronSecret) != null ? _a : "");
  const q = getQuery(event);
  if (!secret || String((_b = q.token) != null ? _b : "") !== secret) throw createError({ statusCode: 403, statusMessage: "Invalid token" });
  await sendTelegram(`\u{1F534} <b>Database backup problem</b>
<code>${String((_c = q.msg) != null ? _c : "").slice(0, 300).replace(/[<>&]/g, "")}</code>`, "backup");
  return { ok: true };
});

export { backupAlert_get as default };
//# sourceMappingURL=backup-alert.get.mjs.map
