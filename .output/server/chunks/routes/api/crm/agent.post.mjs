import { V as defineEventHandler, L as crmUser, bb as readBody, J as createError, s as askAgent } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const agent_post = defineEventHandler(async (event) => {
  var _a;
  const me = await crmUser(event), b = await readBody(event);
  const question = String((_a = b == null ? void 0 : b.question) != null ? _a : "").trim();
  if (!question) throw createError({ statusCode: 400, statusMessage: "Ask a question" });
  const history = Array.isArray(b == null ? void 0 : b.history) ? b.history.filter((h) => ["user", "assistant"].includes(h == null ? void 0 : h.role) && typeof (h == null ? void 0 : h.text) === "string") : [];
  return await askAgent(event, me.id, question, history);
});

export { agent_post as default };
//# sourceMappingURL=agent.post.mjs.map
