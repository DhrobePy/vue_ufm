import { h as defineEventHandler, v as getRouterParam, L as readBody, w as getUserSession, e as createError, K as queryOne, n as getDb } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const workflow_post = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { to_status, comments } = body != null ? body : {};
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  if (!id || !to_status)
    throw createError({ statusCode: 400, statusMessage: "id and to_status required" });
  const order = await queryOne(
    "SELECT status FROM credit_orders WHERE id = ?",
    [id]
  );
  if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [to_status, id]
    );
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, to_status, to_status, userId, comments != null ? comments : null]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true, newStatus: to_status };
});

export { workflow_post as default };
//# sourceMappingURL=workflow.post.mjs.map
