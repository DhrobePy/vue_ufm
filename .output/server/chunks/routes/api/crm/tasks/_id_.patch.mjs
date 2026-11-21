import { V as defineEventHandler, L as crmUser, aq as getRouterParam, bb as readBody, b8 as query, J as createError } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const me = await crmUser(event), id = Number(getRouterParam(event, "id")), b = await readBody(event);
  const [t] = await query(`SELECT * FROM crm_tasks WHERE id = ?`, [id]);
  if (!t) throw createError({ statusCode: 404, statusMessage: "Task not found" });
  const sets = [], params = [];
  if (["open", "done", "cancelled"].includes(b == null ? void 0 : b.status)) {
    sets.push("status = ?", "completed_at = ?");
    params.push(b.status, b.status === "open" ? null : (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(String((_a = b == null ? void 0 : b.due_date) != null ? _a : ""))) {
    sets.push("due_date = ?");
    params.push(b.due_date);
  }
  if (b == null ? void 0 : b.title) {
    sets.push("title = ?");
    params.push(String(b.title).slice(0, 300));
  }
  if (sets.length) await query(`UPDATE crm_tasks SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);
  if ((b == null ? void 0 : b.status) === "done" && String((_b = b == null ? void 0 : b.outcome) != null ? _b : "").trim())
    await query(`INSERT INTO crm_interactions (party_type, party_id, channel, summary, outcome, user_id) VALUES (?, ?, 'note', ?, 'task done', ?)`, [t.party_type, t.party_id, `${t.title} \u2014 ${String(b.outcome).trim().slice(0, 800)}`, me.id]);
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
