import { Z as defineEventHandler, aB as getRouterParam, bq as readBody, bU as scopedHealth, N as createError, U as crossSell, bF as reorderRadar, a5 as draftCustomerMessage } from '../../../../../nitro/nitro.mjs';
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
  var _a, _b;
  const id = Number(getRouterParam(event, "id")), b = await readBody(event), rows = await scopedHealth(event), c = rows.find((r) => r.id === id);
  if (!c) throw createError({ statusCode: 404, statusMessage: "Customer not found, or outside your branch." });
  const kind = ["reorder", "collect", "winback", "crosssell", "checkin"].includes(b == null ? void 0 : b.kind) ? b.kind : "checkin";
  const channel = ["sms", "whatsapp", "email"].includes(b == null ? void 0 : b.channel) ? b.channel : "whatsapp";
  const extra = {};
  if (kind === "crosssell") extra.product = (_a = (await crossSell(rows)).suggestions.find((s) => s.customer_id === id)) == null ? void 0 : _a.product;
  if (kind === "reorder") extra.gap = (_b = (await reorderRadar(rows)).find((r) => r.id === id)) == null ? void 0 : _b.usual_gap;
  return await draftCustomerMessage(c, kind, channel, (b == null ? void 0 : b.lang) === "en" ? "en" : "bn", extra);
});

export { draft_post as default };
//# sourceMappingURL=draft.post.mjs.map
