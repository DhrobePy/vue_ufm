import { q as defineEventHandler, m as createError, J as getQuery, aJ as sendOwnerDigestNow, aQ as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const dailyDigest_get = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig();
  const secret = String((_a = config.cronSecret) != null ? _a : "");
  if (!secret)
    throw createError({ statusCode: 503, statusMessage: "Cron endpoints are not configured (set NUXT_CRON_SECRET)" });
  const token = String((_b = getQuery(event).token) != null ? _b : "");
  if (token !== secret)
    throw createError({ statusCode: 403, statusMessage: "Invalid token" });
  const result = await sendOwnerDigestNow();
  return { ok: true, ...result };
});

export { dailyDigest_get as default };
//# sourceMappingURL=daily-digest.get.mjs.map
