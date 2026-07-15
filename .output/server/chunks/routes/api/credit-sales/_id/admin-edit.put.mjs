import { n as defineEventHandler, K as getRouterParam, aa as readBody, N as getUserSession, a as ADMIN_ROLES, j as createError, v as getDb, e as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const EDITABLE = ["required_date", "priority", "shipping_address", "special_instructions"];
const adminEdit_put = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 0);
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT * FROM credit_orders WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const changes = {};
    const sets = [];
    const params = [];
    for (const f of EDITABLE) {
      if (body[f] !== void 0 && String((_e = body[f]) != null ? _e : "") !== String((_f = order[f]) != null ? _f : "")) {
        changes[f] = { from: order[f], to: body[f] };
        sets.push(`${f} = ?`);
        params.push(body[f] === "" ? null : body[f]);
      }
    }
    if (!sets.length) {
      await conn.rollback();
      return { ok: true, message: "No changes" };
    }
    params.push(id);
    await conn.query(`UPDATE credit_orders SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params);
    const summary = Object.entries(changes).map(([f, c]) => {
      var _a2, _b2;
      return `${f}: "${(_a2 = c.from) != null ? _a2 : "\u2014"}" \u2192 "${(_b2 = c.to) != null ? _b2 : "\u2014"}"`;
    }).join(" \xB7 ");
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'admin_edit', ?, ?, NOW())`,
      [id, order.status, order.status, userId, `Admin edit \u2014 ${summary}`.slice(0, 500)]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Admin edit on ${order.order_number}: ${summary}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, changed: Object.keys(changes) };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { adminEdit_put as default };
//# sourceMappingURL=admin-edit.put.mjs.map
