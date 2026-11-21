import { Z as defineEventHandler, az as getRouterParam, bo as readBody, bl as query, N as createError, w as assessProspect, V as customerHealth, a6 as draftOutreach } from '../../../../../nitro/nitro.mjs';
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

const draft_post = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id")), b = await readBody(event);
  const [p] = await query(`SELECT * FROM crm_prospects WHERE id = ?`, [id]);
  if (!p) throw createError({ statusCode: 404, statusMessage: "Prospect not found" });
  p.checklist = typeof p.checklist === "string" ? JSON.parse(p.checklist || "{}") : (_a = p.checklist) != null ? _a : {};
  const a = await assessProspect(p, await customerHealth());
  const channel = ["sms", "whatsapp", "email"].includes(b == null ? void 0 : b.channel) ? b.channel : "sms";
  return await draftOutreach(p, a, channel, (b == null ? void 0 : b.lang) === "en" ? "en" : "bn");
});

export { draft_post as default };
//# sourceMappingURL=draft.post.mjs.map
