import { Z as defineEventHandler, as as getQuery, c3 as useRuntimeConfig, bQ as safeEqual, N as createError } from '../../../nitro/nitro.mjs';
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

const whatsapp_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const q = getQuery(event), token = String((_a = useRuntimeConfig().whatsappVerifyToken) != null ? _a : "");
  if (!token || q["hub.mode"] !== "subscribe" || !safeEqual(String((_b = q["hub.verify_token"]) != null ? _b : ""), token)) throw createError({ statusCode: 403, statusMessage: "Verification failed" });
  return String((_c = q["hub.challenge"]) != null ? _c : "");
});

export { whatsapp_get as default };
//# sourceMappingURL=whatsapp.get.mjs.map
