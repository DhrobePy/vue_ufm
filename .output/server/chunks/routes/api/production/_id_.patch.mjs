import { q as defineEventHandler, X as getUserSession, e as PRODUCTION_ROLES, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, m as createError, aq as readBody, z as getDb, g as auditLog, aG as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const UI_TO_DB = {
  running: "in_progress",
  paused: "delayed",
  completed: "completed",
  cancelled: "delayed",
  pending: "pending"
};
const ALLOWED_ROLES = [...PRODUCTION_ROLES, ...ADMIN_ROLES, ...ACCOUNTS_ROLES];
const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ALLOWED_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const userId = Number((_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) || 1;
  const userName = (_e = (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.name) != null ? _e : `User ${userId}`;
  const rawId = ((_f = event.context.params) == null ? void 0 : _f.id) || "";
  const numericId = Number(rawId.replace(/^PS-/i, ""));
  if (!numericId) throw createError({ statusCode: 400, statusMessage: "Invalid production ID" });
  const body = await readBody(event);
  const { status, notes, bags_completed } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (status) {
    const dbStatus = (_g = UI_TO_DB[status]) != null ? _g : status;
    sets.push("status = ?");
    params.push(dbStatus);
    if (status === "running") {
      sets.push("production_started_at = COALESCE(production_started_at, NOW())");
    }
    if (status === "completed") {
      sets.push("production_completed_at = NOW()");
    }
  }
  if (notes !== void 0) {
    sets.push("notes = ?");
    params.push(notes);
  }
  if (bags_completed !== void 0) {
    sets.push("bags_completed = ?");
    params.push(Math.max(0, Number(bags_completed) || 0));
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    sets.push("updated_at = NOW()");
    const updateParams = [...params, numericId];
    await conn.query(
      `UPDATE production_schedule SET ${sets.join(", ")} WHERE id = ?`,
      updateParams
    );
    let orderAdvanced = false;
    if (status === "completed") {
      const [[ps]] = await conn.query(
        `SELECT order_id FROM production_schedule WHERE id = ?`,
        [numericId]
      );
      if (ps == null ? void 0 : ps.order_id) {
        const [[order]] = await conn.query(
          `SELECT id, order_number, status FROM credit_orders WHERE id = ? FOR UPDATE`,
          [ps.order_id]
        );
        if (order && order.status === "in_production") {
          await conn.query(
            `UPDATE credit_orders SET status = 'ready_to_ship', updated_at = NOW() WHERE id = ?`,
            [order.id]
          );
          await conn.query(
            `INSERT INTO credit_order_workflow
               (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
             VALUES (?, 'in_production', 'ready_to_ship', 'ready_to_ship', ?, ?, NOW())`,
            [order.id, userId, `Production batch #${numericId} marked complete by ${userName}`]
          );
          await auditLog(conn, {
            userId,
            action: "status_changed",
            module: "credit_sales",
            recordType: "credit_order",
            recordId: order.id,
            referenceNumber: order.order_number,
            description: `Order ${order.order_number}: in_production \u2192 ready_to_ship (production batch #${numericId} completed)`,
            severity: "info"
          });
          orderAdvanced = true;
        }
      }
    }
    await conn.commit();
    if (orderAdvanced) {
      sendTelegram(`\u2705 <b>Production Complete</b>
Batch #${numericId} \u2014 ready to ship
by ${userName}`, "production");
    }
    return { ok: true, orderAdvanced };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
