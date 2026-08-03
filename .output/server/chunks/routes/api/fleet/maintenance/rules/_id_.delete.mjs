import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, ao as queryOne, z as getDb, aw as recycleBegin, av as recycleArchiveDelete, ax as recycleFinalize } from '../../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const userName = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const rule = await queryOne(`SELECT id, rule_name FROM preventive_maintenance_rules WHERE id = ?`, [id]);
  if (!rule) throw createError({ statusCode: 404, statusMessage: "Rule not found" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const batchId = await recycleBegin(conn, {
      entityType: "maintenance_rule",
      label: (_e = rule.rule_name) != null ? _e : `Rule-${id}`,
      userId,
      userName
    });
    await recycleArchiveDelete(conn, batchId, "preventive_maintenance_rules", "id", id);
    await recycleFinalize(conn, batchId);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
