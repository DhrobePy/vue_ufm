import { Z as defineEventHandler, c3 as useRuntimeConfig, N as createError, as as getQuery, bT as sendCrmBrief } from '../../../nitro/nitro.mjs';
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

const crmBrief_get = defineEventHandler(async (event) => {
  var _a, _b;
  const secret = String((_a = useRuntimeConfig().cronSecret) != null ? _a : "");
  if (!secret) throw createError({ statusCode: 503, statusMessage: "Cron endpoints are not configured (set NUXT_CRON_SECRET)" });
  const q = getQuery(event);
  if (String((_b = q.token) != null ? _b : "") !== secret) throw createError({ statusCode: 403, statusMessage: "Invalid token" });
  return { ok: true, ...await sendCrmBrief(q.force === "1") };
});

export { crmBrief_get as default };
//# sourceMappingURL=crm-brief.get.mjs.map
