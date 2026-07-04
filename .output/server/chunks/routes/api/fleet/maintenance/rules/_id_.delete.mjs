import { m as defineEventHandler, H as getRouterParam, i as createError, a2 as query } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  await query(`DELETE FROM preventive_maintenance_rules WHERE id = ?`, [id]);
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
