import { j as defineEventHandler, F as getUserSession, a as ADMIN_ROLES, f as createError, _ as readBody, q as getDb, b as auditLog } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const approvalLimits_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const adminId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 0);
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const userId = Number(body == null ? void 0 : body.user_id);
  const amount = (body == null ? void 0 : body.max_order_amount) != null ? Number(body.max_order_amount) : null;
  if (!userId) throw createError({ statusCode: 400, statusMessage: "user_id required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    if (amount === null || amount <= 0) {
      await conn.query(`DELETE FROM user_approval_limits WHERE user_id = ?`, [userId]);
    } else {
      await conn.query(
        `INSERT INTO user_approval_limits (user_id, max_order_amount, set_by_user_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE max_order_amount = VALUES(max_order_amount),
                                 set_by_user_id = VALUES(set_by_user_id)`,
        [userId, amount, adminId]
      );
    }
    await auditLog(conn, {
      userId: adminId,
      action: "user_updated",
      module: "credit_sales",
      recordType: "user_approval_limit",
      recordId: userId,
      description: amount && amount > 0 ? `Approval limit for user #${userId} set to \u09F3${amount.toLocaleString()}` : `Approval limit for user #${userId} removed`,
      severity: "warning"
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

export { approvalLimits_post as default };
//# sourceMappingURL=approval-limits.post.mjs.map
