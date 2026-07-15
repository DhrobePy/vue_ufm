import { o as defineEventHandler, O as getUserSession, k as createError, L as getRouterParam, w as getDb, ak as recyclePurge, e as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const purge_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (role !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Superadmin access required to permanently purge" });
  const userId = Number((session == null ? void 0 : session.user).id);
  const userName = (_c = (session == null ? void 0 : session.user).name) != null ? _c : `User ${userId}`;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid batch ID" });
  const [[batch]] = await getDb().query(`SELECT entity_type, label FROM recycle_bin_batches WHERE id = ?`, [id]);
  if (!batch) throw createError({ statusCode: 404, statusMessage: "Batch not found" });
  await recyclePurge(getDb, id, userId);
  await auditLog(getDb(), {
    userId,
    action: "other",
    module: "admin",
    recordType: "recycle_bin_batch",
    recordId: id,
    referenceNumber: batch.label,
    description: `Permanently purged from Recycle Bin \u2014 ${batch.entity_type} "${batch.label}" by ${userName} \u2014 unrecoverable`,
    severity: "critical"
  });
  return { ok: true };
});

export { purge_post as default };
//# sourceMappingURL=purge.post.mjs.map
