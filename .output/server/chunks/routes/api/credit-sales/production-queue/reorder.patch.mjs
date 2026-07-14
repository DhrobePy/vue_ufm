import { n as defineEventHandler, K as getUserSession, j as createError, a7 as readBody, u as getDb } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reorder_patch = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can reorder the production queue" });
  }
  const body = await readBody(event);
  const ids = body == null ? void 0 : body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "ids array is required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < ids.length; i++) {
      await conn.query(
        `UPDATE credit_orders SET production_seq = ?, updated_at = NOW() WHERE id = ?`,
        [i + 1, Number(ids[i])]
      );
    }
    await conn.commit();
    return { ok: true, count: ids.length };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reorder_patch as default };
//# sourceMappingURL=reorder.patch.mjs.map
