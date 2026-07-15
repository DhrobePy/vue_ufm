import { n as defineEventHandler, K as getRouterParam, ab as readBody, N as getUserSession, j as createError, T as isAccountsRole, v as getDb, e as auditLog, ap as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reject_post = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid request id" });
  const note = (body == null ? void 0 : body.note) ? String(body.note).slice(0, 255) : null;
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
       SET status = 'rejected', decided_by_user_id = ?, decided_at = NOW(), decision_note = ?
       WHERE id = ?`,
      [userId, note, id]
    );
    await auditLog(conn, {
      userId,
      action: "rejected",
      module: "credit_sales",
      recordType: "credit_pending_request",
      recordId: id,
      description: `Rejected queued ${req.request_type} \u2014 ${req.reference_label}${note ? ` \xB7 ${note}` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(`\u274C <b>Queued Payment Rejected</b>
${req.reference_label}
by ${userName}${note ? `
Reason: ${note}` : ""}`);
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reject_post as default };
//# sourceMappingURL=reject.post.mjs.map
