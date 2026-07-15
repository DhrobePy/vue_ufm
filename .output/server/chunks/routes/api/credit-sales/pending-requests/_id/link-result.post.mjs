import { n as defineEventHandler, K as getRouterParam, aa as readBody, N as getUserSession, j as createError, S as isAccountsRole, v as getDb, e as auditLog } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const linkResult_post = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid request id" });
  const paymentId = Number(body == null ? void 0 : body.payment_id);
  if (!paymentId) throw createError({ statusCode: 400, statusMessage: "payment_id required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[req]] = await conn.query(
      `SELECT * FROM credit_pending_requests WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!req) throw createError({ statusCode: 404, statusMessage: "Request not found" });
    if (req.status !== "pending")
      throw createError({ statusCode: 409, statusMessage: `Request already ${req.status}` });
    if (req.requested_by_user_id === userId)
      throw createError({ statusCode: 403, statusMessage: "You cannot decide your own request" });
    await conn.query(
      `UPDATE credit_pending_requests
       SET status = 'approved', decided_by_user_id = ?, decided_at = NOW(), result_payment_id = ?
       WHERE id = ?`,
      [userId, paymentId, id]
    );
    await auditLog(conn, {
      userId,
      action: "approved",
      module: "credit_sales",
      recordType: "credit_pending_request",
      recordId: id,
      description: `Approved & posted queued ${req.request_type} \u2014 ${req.reference_label} (payment #${paymentId})`,
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

export { linkResult_post as default };
//# sourceMappingURL=link-result.post.mjs.map
