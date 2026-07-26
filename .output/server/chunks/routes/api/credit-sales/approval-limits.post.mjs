import { p as defineEventHandler, V as getUserSession, b as ADMIN_ROLES, l as createError, am as readBody, y as getDb, a as ACTION_LIMIT_KEYS, f as auditLog } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const approvalLimits_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const adminId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 0);
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const userId = Number(body == null ? void 0 : body.user_id);
  const orderCap = Math.max(0, Number((_e = body == null ? void 0 : body.max_order_amount) != null ? _e : 0));
  const txnCap = Math.max(0, Number((_f = body == null ? void 0 : body.max_transaction_amount) != null ? _f : 0));
  if (!userId) throw createError({ statusCode: 400, statusMessage: "user_id required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    if (orderCap <= 0 && txnCap <= 0) {
      await conn.query(`DELETE FROM user_approval_limits WHERE user_id = ?`, [userId]);
    } else {
      await conn.query(
        `INSERT INTO user_approval_limits (user_id, max_order_amount, max_transaction_amount, set_by_user_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE max_order_amount = VALUES(max_order_amount),
                                 max_transaction_amount = VALUES(max_transaction_amount),
                                 set_by_user_id = VALUES(set_by_user_id)`,
        [userId, orderCap, txnCap, adminId]
      );
    }
    if ((body == null ? void 0 : body.action_limits) && typeof body.action_limits === "object") {
      for (const key of ACTION_LIMIT_KEYS) {
        if (body.action_limits[key] === void 0) continue;
        const amt = Math.max(0, Number(body.action_limits[key]) || 0);
        if (amt <= 0) {
          await conn.query(`DELETE FROM user_action_limits WHERE user_id = ? AND action_key = ?`, [userId, key]);
        } else {
          await conn.query(
            `INSERT INTO user_action_limits (user_id, action_key, max_amount, set_by_user_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE max_amount = VALUES(max_amount), set_by_user_id = VALUES(set_by_user_id)`,
            [userId, key, amt, adminId]
          );
        }
      }
    }
    await auditLog(conn, {
      userId: adminId,
      action: "user_updated",
      module: "credit_sales",
      recordType: "user_approval_limit",
      recordId: userId,
      description: orderCap > 0 || txnCap > 0 ? `Authority for user #${userId}: order approval \u09F3${orderCap.toLocaleString()}, transaction \u09F3${txnCap.toLocaleString()}` : `Authority limits for user #${userId} removed`,
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
