import { n as defineEventHandler, K as getRouterParam, N as getUserSession, j as createError, S as isAccountsRole, v as getDb, e as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const retrieve_post = defineEventHandler(async (event) => {
  var _a;
  const odId = Number(getRouterParam(event, "odId"));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role) && !["dispatch-srg", "dispatch-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts, dispatch or admin only" });
  if (!odId) throw createError({ statusCode: 400, statusMessage: "Invalid over-delivery ID" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[od]] = await conn.query(
      `SELECT * FROM credit_order_over_deliveries WHERE id = ? FOR UPDATE`,
      [odId]
    );
    if (!od) throw createError({ statusCode: 404, statusMessage: "Over-delivery not found" });
    if (od.status !== "approved" || od.resolution !== "retrieve")
      throw createError({ statusCode: 409, statusMessage: 'Only approved "retrieve" over-deliveries can be marked retrieved' });
    if (od.retrieved_at)
      throw createError({ statusCode: 409, statusMessage: "Already marked retrieved" });
    await conn.query(
      `UPDATE credit_order_over_deliveries SET retrieved_at = NOW(), retrieved_by_user_id = ? WHERE id = ?`,
      [userId, odId]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "credit_order_over_delivery",
      recordId: od.order_id,
      referenceNumber: od.od_number,
      description: `Over-delivery ${od.od_number} marked retrieved`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { retrieve_post as default };
//# sourceMappingURL=retrieve.post.mjs.map
