import { m as defineEventHandler, G as getRouterParam, a3 as readBody, J as getUserSession, i as createError, t as getDb, H as getUserApprovalLimit, d as applyAmendment, e as auditLog, a9 as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const decide_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const amendmentId = Number(getRouterParam(event, "amendmentId"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const action = String((_c = body == null ? void 0 : body.action) != null ? _c : "");
  const note = (body == null ? void 0 : body.note) ? String(body.note).slice(0, 255) : null;
  if (!amendmentId || !["approve", "reject"].includes(action))
    throw createError({ statusCode: 400, statusMessage: "amendmentId and action (approve|reject) required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[amd]] = await conn.query(
      `SELECT a.*, o.order_number, o.customer_id, o.total_amount AS order_total, c.name AS customer_name
       FROM order_amendments a
       JOIN credit_orders o ON o.id = a.order_id
       JOIN customers c ON c.id = o.customer_id
       WHERE a.id = ? FOR UPDATE`,
      [amendmentId]
    );
    if (!amd) throw createError({ statusCode: 404, statusMessage: "Amendment not found" });
    if (amd.status !== "pending")
      throw createError({ statusCode: 409, statusMessage: `Amendment already ${amd.status}` });
    const newValues = amd.new_values ? JSON.parse(amd.new_values) : {};
    const delta = amd.regime === "pre" ? Number((_d = newValues.total_amount) != null ? _d : 0) - Number((_f = JSON.parse((_e = amd.old_values) != null ? _e : "{}").total_amount) != null ? _f : 0) : Number((_g = amd.flat_amount) != null ? _g : 0);
    const { limit, source } = await getUserApprovalLimit(conn, userId, role);
    const mayDecide = source === "admin" || source === "personal" && (delta <= 0 || delta <= limit);
    if (!mayDecide)
      throw createError({ statusCode: 403, statusMessage: `You need admin authority or a delegated limit \u2265 \u09F3${delta.toLocaleString()}` });
    if (action === "approve") {
      await applyAmendment(conn, {
        amendmentId,
        order: { id: amd.order_id, order_number: amd.order_number, customer_id: amd.customer_id },
        regime: amd.regime,
        flatAmount: amd.flat_amount != null ? Number(amd.flat_amount) : null,
        newValues,
        amdNo: amd.amendment_number,
        userId
      });
    }
    await conn.query(
      `UPDATE order_amendments SET status = ?, decided_by = ?, decided_at = NOW(), decision_note = ?
       WHERE id = ?`,
      [action === "approve" ? "approved" : "rejected", userId, note, amendmentId]
    );
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       SELECT o.id, o.status, o.status, ?, ?, ?, NOW() FROM credit_orders o WHERE o.id = ?`,
      [`amendment_${action}d`, userId, `${amd.amendment_number}${note ? ` \u2014 ${note}` : ""}`, amd.order_id]
    );
    await auditLog(conn, {
      userId,
      action: action === "approve" ? "approved" : "rejected",
      module: "credit_sales",
      recordType: "order_amendment",
      recordId: amendmentId,
      referenceNumber: amd.amendment_number,
      description: `Amendment ${amd.amendment_number} ${action}d on ${amd.order_number} (\u0394\u09F3${delta.toLocaleString()})${note ? ` \xB7 ${note}` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `${action === "approve" ? "\u2705" : "\u274C"} <b>Amendment ${action === "approve" ? "Approved" : "Rejected"}</b>
${amd.amendment_number} on ${amd.order_number} \u2014 ${amd.customer_name}
\u0394\u09F3${delta.toLocaleString()} \xB7 by ${userName}${note ? `
${note}` : ""}`
    );
    return { ok: true, status: action === "approve" ? "approved" : "rejected" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { decide_post as default };
//# sourceMappingURL=decide.post.mjs.map
