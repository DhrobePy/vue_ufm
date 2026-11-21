import { J as defineEventHandler, F as crmUser, C as createError, ag as getRouterParam, aW as query } from '../../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const _id__delete = defineEventHandler(async (event) => {
  const me = await crmUser(event);
  if (!["admin", "superadmin"].includes(me.role)) throw createError({ statusCode: 403, statusMessage: "Only admin can delete a prospect \u2014 mark it Lost instead" });
  const id = Number(getRouterParam(event, "id"));
  await query(`DELETE FROM crm_tasks WHERE party_type = 'prospect' AND party_id = ?`, [id]);
  await query(`DELETE FROM crm_interactions WHERE party_type = 'prospect' AND party_id = ?`, [id]);
  await query(`DELETE FROM crm_prospects WHERE id = ?`, [id]);
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
