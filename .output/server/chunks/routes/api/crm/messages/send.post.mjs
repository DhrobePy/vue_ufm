import { Z as defineEventHandler, Q as crmUser, bq as readBody, bn as query, N as createError, bW as sendMessage } from '../../../../nitro/nitro.mjs';
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

const send_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const me = await crmUser(event), b = await readBody(event);
  const type = (b == null ? void 0 : b.party_type) === "prospect" ? "prospect" : (b == null ? void 0 : b.party_type) === "customer" ? "customer" : null, pid = Number(b == null ? void 0 : b.party_id) || null;
  let to = String((_a = b == null ? void 0 : b.to) != null ? _a : "").trim();
  if (!to && type && pid) to = String((_c = (_b = (await query(type === "customer" ? `SELECT phone_number AS ph FROM customers WHERE id = ?` : `SELECT phone AS ph FROM crm_prospects WHERE id = ?`, [pid]))[0]) == null ? void 0 : _b.ph) != null ? _c : "");
  if (!to) throw createError({ statusCode: 400, statusMessage: "No phone number on record for this contact." });
  return sendMessage({ channel: (b == null ? void 0 : b.channel) === "whatsapp" ? "whatsapp" : "sms", partyType: type, partyId: pid, to, text: String((_d = b == null ? void 0 : b.text) != null ? _d : ""), userId: me.id });
});

export { send_post as default };
//# sourceMappingURL=send.post.mjs.map
