import { V as defineEventHandler, L as crmUser, aq as getRouterParam, bb as readBody, l as SEGMENTS, J as createError, ab as getDb, v as auditLog, H as clearCrmCache } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const me = await crmUser(event), id = Number(getRouterParam(event, "id")), b = await readBody(event);
  const sets = [], params = [];
  if ("segment" in b) {
    const v = String((_a = b.segment) != null ? _a : "").trim();
    if (v && !SEGMENTS.includes(v)) throw createError({ statusCode: 400, statusMessage: "Unknown business type" });
    sets.push("segment = ?");
    params.push(v || null);
  }
  if ("district" in b) {
    sets.push("district = ?");
    params.push(String((_b = b.district) != null ? _b : "").trim().slice(0, 40) || null);
  }
  if ("owner_user_id" in b) {
    sets.push("owner_user_id = ?");
    params.push(Number(b.owner_user_id) || null);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to change" });
  const conn = await getDb().getConnection();
  try {
    const [r] = await conn.query(`UPDATE customers SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);
    if (!r.affectedRows) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    await auditLog(conn, { userId: me.id, action: "crm_profile_set", module: "crm", recordType: "customer", recordId: id, description: `CRM profile changed (${Object.keys(b).join(", ")}) by ${me.name}`, severity: "info" });
  } finally {
    conn.release();
  }
  clearCrmCache();
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
