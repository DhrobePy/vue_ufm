import { V as defineEventHandler, L as crmUser, bb as readBody, J as createError, b8 as query } from '../../../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
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

const interactions_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const me = await crmUser(event), b = await readBody(event);
  const type = (b == null ? void 0 : b.party_type) === "prospect" ? "prospect" : "customer", pid = Number(b == null ? void 0 : b.party_id), summary = String((_a = b == null ? void 0 : b.summary) != null ? _a : "").trim().slice(0, 1e3);
  if (!pid || !summary) throw createError({ statusCode: 400, statusMessage: "party_id and summary are required" });
  const channel = ["call", "visit", "sms", "whatsapp", "email", "note"].includes(b == null ? void 0 : b.channel) ? b.channel : "note";
  const r = await query(
    `INSERT INTO crm_interactions (party_type, party_id, channel, direction, summary, outcome, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, pid, channel, (b == null ? void 0 : b.direction) === "in" ? "in" : "out", summary, String((_b = b == null ? void 0 : b.outcome) != null ? _b : "").slice(0, 120) || null, me.id]
  );
  if (/^\d{4}-\d{2}-\d{2}$/.test(String((_c = b == null ? void 0 : b.follow_up_date) != null ? _c : "")))
    await query(
      `INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, pid, Number(b == null ? void 0 : b.promise_amount) > 0 ? "promise" : "follow_up", Number(b == null ? void 0 : b.promise_amount) > 0 ? `Promised \u09F3${Number(b.promise_amount).toLocaleString()} \u2014 check it arrived` : `Follow up: ${summary.slice(0, 120)}`, b.follow_up_date, Number(b == null ? void 0 : b.promise_amount) || null, me.id, me.id]
    );
  return { ok: true, id: r.insertId };
});

export { interactions_post as default };
//# sourceMappingURL=interactions.post.mjs.map
