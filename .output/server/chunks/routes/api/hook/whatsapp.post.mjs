import { Z as defineEventHandler, c3 as useRuntimeConfig, N as createError, br as readRawBody, c6 as verifyMetaSignature, an as getHeader, bt as recordInbound } from '../../../nitro/nitro.mjs';
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

const whatsapp_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const secret = String((_a = useRuntimeConfig().whatsappAppSecret) != null ? _a : "");
  if (!secret) throw createError({ statusCode: 503, statusMessage: "Not configured" });
  const raw = (_b = await readRawBody(event, "utf8")) != null ? _b : "";
  if (!verifyMetaSignature(raw, getHeader(event, "x-hub-signature-256"), secret)) throw createError({ statusCode: 403, statusMessage: "Bad signature" });
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: true };
  }
  for (const e of (_c = body == null ? void 0 : body.entry) != null ? _c : []) for (const ch of (_d = e == null ? void 0 : e.changes) != null ? _d : []) for (const m of (_f = (_e = ch == null ? void 0 : ch.value) == null ? void 0 : _e.messages) != null ? _f : [])
    if ((m == null ? void 0 : m.type) === "text" && ((_g = m == null ? void 0 : m.text) == null ? void 0 : _g.body)) await recordInbound("whatsapp", String((_h = m.from) != null ? _h : ""), m.text.body, String((_i = m.id) != null ? _i : "") || null).catch((err) => {
      var _a2;
      return console.warn("[hook/whatsapp]", (_a2 = err == null ? void 0 : err.message) != null ? _a2 : err);
    });
    else if ((m == null ? void 0 : m.type) === "button" && ((_j = m == null ? void 0 : m.button) == null ? void 0 : _j.text)) await recordInbound("whatsapp", String((_k = m.from) != null ? _k : ""), m.button.text, String((_l = m.id) != null ? _l : "") || null).catch(() => {
    });
  return { ok: true };
});

export { whatsapp_post as default };
//# sourceMappingURL=whatsapp.post.mjs.map
