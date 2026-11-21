import { Z as defineEventHandler, Q as crmUser, az as getRouterParam, bo as readBody, bl as query, N as createError, n as SEGMENTS } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const me = await crmUser(event), id = Number(getRouterParam(event, "id")), b = await readBody(event);
  const [p] = await query(`SELECT * FROM crm_prospects WHERE id = ?`, [id]);
  if (!p) throw createError({ statusCode: 404, statusMessage: "Prospect not found" });
  const sets = [], params = [];
  for (const k of ["name", "business_name", "district", "address", "phone", "phone2", "email", "website", "contact_person", "source", "source_url", "source_note", "notes", "lost_reason"])
    if (k in b) {
      sets.push(`${k} = ?`);
      params.push(String((_a = b[k]) != null ? _a : "").trim().slice(0, k === "notes" ? 2e3 : 500) || null);
    }
  if ("segment" in b) {
    const v = String((_b = b.segment) != null ? _b : "");
    if (v && !SEGMENTS.includes(v)) throw createError({ statusCode: 400, statusMessage: "Unknown business type" });
    sets.push("segment = ?");
    params.push(v || null);
  }
  if ("owner_user_id" in b) {
    sets.push("owner_user_id = ?");
    params.push(Number(b.owner_user_id) || null);
  }
  if ("converted_customer_id" in b) {
    sets.push("converted_customer_id = ?");
    params.push(Number(b.converted_customer_id) || null);
  }
  if ((b == null ? void 0 : b.checklist) && typeof b.checklist === "object") {
    const cur = typeof p.checklist === "string" ? JSON.parse(p.checklist || "{}") : (_c = p.checklist) != null ? _c : {};
    sets.push("checklist = ?");
    params.push(JSON.stringify({ ...cur, ...b.checklist }));
  }
  let stageNote = "";
  if (["new", "researching", "contacted", "quoted", "trial", "won", "lost"].includes(b == null ? void 0 : b.stage) && b.stage !== p.stage) {
    sets.push("stage = ?");
    params.push(b.stage);
    stageNote = `Stage: ${p.stage} \u2192 ${b.stage}${b.stage === "lost" && b.lost_reason ? ` (${String(b.lost_reason).slice(0, 100)})` : ""}`;
  }
  if (!sets.length) return { ok: true };
  await query(`UPDATE crm_prospects SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);
  if (stageNote) await query(`INSERT INTO crm_interactions (party_type, party_id, channel, summary, user_id) VALUES ('prospect', ?, 'note', ?, ?)`, [id, stageNote, me.id]);
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
