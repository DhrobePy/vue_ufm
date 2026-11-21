import { Z as defineEventHandler, az as getRouterParam, bl as query, N as createError, w as assessProspect, V as customerHealth } from '../../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  const [p] = await query(`SELECT p.*, u.display_name AS owner_name FROM crm_prospects p LEFT JOIN users u ON u.id = p.owner_user_id WHERE p.id = ?`, [id]);
  if (!p) throw createError({ statusCode: 404, statusMessage: "Prospect not found" });
  p.checklist = typeof p.checklist === "string" ? JSON.parse(p.checklist || "{}") : (_a = p.checklist) != null ? _a : {};
  const [assessment, interactions, tasks] = await Promise.all([
    assessProspect(p, await customerHealth()),
    query(`SELECT i.id, i.channel, i.direction, i.summary, i.outcome, i.created_at, i.via_agent, u.display_name AS by_user FROM crm_interactions i LEFT JOIN users u ON u.id = i.user_id WHERE i.party_type = 'prospect' AND i.party_id = ? ORDER BY i.id DESC LIMIT 50`, [id]),
    query(`SELECT id, kind, title, due_date, status, created_by_agent FROM crm_tasks WHERE party_type = 'prospect' AND party_id = ? ORDER BY (status = 'open') DESC, due_date, id DESC LIMIT 30`, [id])
  ]);
  return { prospect: p, assessment, interactions, tasks };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
