import { Z as defineEventHandler, c3 as useRuntimeConfig, N as createError, bQ as safeEqual, as as getQuery, bo as readBody, bt as recordInbound } from '../../../nitro/nitro.mjs';
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

const sms_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const secret = String((_a = useRuntimeConfig().crmWebhookSecret) != null ? _a : "");
  if (!secret) throw createError({ statusCode: 503, statusMessage: "Not configured" });
  if (!safeEqual(String((_b = getQuery(event).token) != null ? _b : ""), secret)) throw createError({ statusCode: 403, statusMessage: "Invalid token" });
  const b = (_c = await readBody(event).catch(() => ({}))) != null ? _c : {}, q = getQuery(event);
  const pick = (...k) => {
    var _a2;
    for (const key of k) {
      const v = (_a2 = b[key]) != null ? _a2 : q[key];
      if (v) return String(v);
    }
    return "";
  };
  return { ok: true, ...await recordInbound("sms", pick("from", "msisdn", "sender", "number"), pick("text", "message", "content", "body"), pick("id", "message_id") || null) };
});

export { sms_post as default };
//# sourceMappingURL=sms.post.mjs.map
