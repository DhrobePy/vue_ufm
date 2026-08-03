import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, z as getDb, az as recycleRestore, g as auditLog, aG as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const restore_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  const userId = Number((session == null ? void 0 : session.user).id);
  const userName = (_c = (session == null ? void 0 : session.user).name) != null ? _c : `User ${userId}`;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid batch ID" });
  const [[batch]] = await getDb().query(`SELECT entity_type, label FROM recycle_bin_batches WHERE id = ?`, [id]);
  if (!batch) throw createError({ statusCode: 404, statusMessage: "Batch not found" });
  const result = await recycleRestore(getDb, id, userId);
  await auditLog(getDb(), {
    userId,
    action: "other",
    module: "admin",
    recordType: "recycle_bin_batch",
    recordId: id,
    referenceNumber: batch.label,
    description: `Restored from Recycle Bin \u2014 ${batch.entity_type} "${batch.label}" (${result.restored} rows) by ${userName}`,
    severity: "critical"
  });
  sendTelegram(
    `\u267B\uFE0F <b>Restored from Recycle Bin</b>
${batch.entity_type}: ${batch.label}
${result.restored} rows restored \xB7 by ${userName}`
  );
  return { ok: true, ...result };
});

export { restore_post as default };
//# sourceMappingURL=restore.post.mjs.map
