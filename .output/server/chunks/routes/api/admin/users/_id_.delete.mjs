import { n as defineEventHandler, I as getRouterParam, j as createError, L as getUserSession, u as getDb, e as auditLog } from '../../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const session = await getUserSession(event);
  const actorId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  if (id === actorId)
    throw createError({ statusCode: 400, statusMessage: "You cannot delete your own account" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[target]] = await conn.query(
      `SELECT id, display_name, email, role, status FROM users WHERE id = ?`,
      [id]
    );
    if (!target) throw createError({ statusCode: 404, statusMessage: "User not found" });
    if (target.status === "deleted")
      throw createError({ statusCode: 400, statusMessage: "User is already deleted" });
    await conn.query(
      `UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    await auditLog(conn, {
      userId: actorId,
      action: "user_deleted",
      module: "admin",
      recordType: "user",
      recordId: id,
      referenceNumber: target.email,
      description: `User "${target.display_name}" (${target.email}) [${target.role}] deleted by ${actorName}`,
      severity: "critical"
    });
    await conn.commit();
    return { ok: true, message: `${target.display_name} has been deleted` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
