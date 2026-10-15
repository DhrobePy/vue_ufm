import { s as defineEventHandler, az as readBody, E as getDb, aL as requireAction, A as ACCOUNTS_ROLES, e as PRODUCTION_ROLES, o as createError, i as auditLog } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ACTIVE = ["approved", "in_production", "produced", "ready_to_ship", "shipped"];
const deliverySchedule_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const conn = await getDb().getConnection();
  try {
    if ((body == null ? void 0 : body.action) === "reorder") {
      await requireAction(event, { module: "credit_sales", page: "delivery-schedule", action: "can_change_priority", roleFallback: [...ACCOUNTS_ROLES, ...PRODUCTION_ROLES] });
      const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter(Boolean);
      if (!ids.length) throw createError({ statusCode: 400, statusMessage: "ids required" });
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i++)
        await conn.query(`UPDATE credit_orders SET delivery_priority = ? WHERE id = ? AND status IN (?)`, [i + 1, ids[i], ACTIVE]);
      await conn.commit();
      return { ok: true };
    }
    if ((body == null ? void 0 : body.action) === "edit") {
      const { userId } = await requireAction(
        event,
        { module: "credit_sales", page: "delivery-schedule", action: "can_edit", roleFallback: [], explicit: true },
        'Only admin, or a user granted "Edit" on the Delivery Schedule, may change these fields'
      );
      const orderId = Number(body.order_id);
      const reqDate = String((_a = body.required_date) != null ? _a : "");
      const dtype = String((_b = body.delivery_type) != null ? _b : "");
      const branchId = Number(body.branch_id);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reqDate)) throw createError({ statusCode: 400, statusMessage: "Invalid required date" });
      if (!["big_truck", "mini_truck"].includes(dtype)) throw createError({ statusCode: 400, statusMessage: "Invalid truck type" });
      await conn.beginTransaction();
      const [[o]] = await conn.query(`SELECT id, order_number, required_date, delivery_type, assigned_branch_id, status FROM credit_orders WHERE id = ? FOR UPDATE`, [orderId]);
      if (!o) throw createError({ statusCode: 404, statusMessage: "Order not found" });
      if (!ACTIVE.includes(o.status)) throw createError({ statusCode: 409, statusMessage: "This order is no longer on the active delivery schedule" });
      const [[br]] = await conn.query(`SELECT id, name FROM branches WHERE id = ? AND status = 'active'`, [branchId]);
      if (!br) throw createError({ statusCode: 400, statusMessage: "Branch not found or inactive" });
      const oldReq = String(o.required_date instanceof Date ? o.required_date.toISOString() : o.required_date).slice(0, 10);
      const changes = [];
      if (oldReq !== reqDate) changes.push(`Required date ${oldReq} \u2192 ${reqDate}`);
      if (o.delivery_type !== dtype) changes.push(`Truck ${o.delivery_type} \u2192 ${dtype}`);
      if (Number(o.assigned_branch_id) !== branchId) changes.push(`Branch \u2192 ${br.name}`);
      if (!changes.length) {
        await conn.rollback();
        return { ok: true, message: "No changes to save" };
      }
      await conn.query(`UPDATE credit_orders SET required_date = ?, delivery_type = ?, assigned_branch_id = ?, updated_at = NOW() WHERE id = ?`, [reqDate, dtype, branchId, orderId]);
      await conn.query(
        `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, 'schedule_edited', ?, ?, NOW())`,
        [orderId, o.status, o.status, userId, `Delivery schedule edit: ${changes.join("; ")}`]
      );
      await auditLog(conn, {
        userId,
        action: "updated",
        module: "credit_sales",
        recordType: "credit_order",
        recordId: orderId,
        referenceNumber: o.order_number,
        description: `Delivery schedule edit on ${o.order_number}: ${changes.join("; ")}`
      });
      await conn.commit();
      return { ok: true, message: "Saved" };
    }
    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
    }
    throw e;
  } finally {
    conn.release();
  }
});

export { deliverySchedule_post as default };
//# sourceMappingURL=delivery-schedule.post.mjs.map
