import { V as defineEventHandler, L as crmUser, bb as readBody, J as createError, b8 as query } from '../../../nitro/nitro.mjs';
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

const tasks_post = defineEventHandler(async (event) => {
  var _a, _b;
  const me = await crmUser(event), b = await readBody(event);
  const type = (b == null ? void 0 : b.party_type) === "prospect" ? "prospect" : "customer", pid = Number(b == null ? void 0 : b.party_id), title = String((_a = b == null ? void 0 : b.title) != null ? _a : "").trim().slice(0, 300);
  if (!pid || !title) throw createError({ statusCode: 400, statusMessage: "party_id and title are required" });
  const kind = ["follow_up", "promise", "collect", "reorder", "credit_review", "visit", "other"].includes(b == null ? void 0 : b.kind) ? b.kind : "follow_up";
  const due = /^\d{4}-\d{2}-\d{2}$/.test(String((_b = b == null ? void 0 : b.due_date) != null ? _b : "")) ? b.due_date : null;
  const r = await query(
    `INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, pid, kind, title, due, Number(b == null ? void 0 : b.promise_amount) || null, Number(b == null ? void 0 : b.assigned_user_id) || me.id, me.id]
  );
  return { ok: true, id: r.insertId };
});

export { tasks_post as default };
//# sourceMappingURL=tasks.post.mjs.map
