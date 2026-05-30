import { g as defineEventHandler, t as getRouterParam, u as getUserSession, d as createError, m as getDb } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can delete orders" });
  }
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT id, customer_id, order_number FROM credit_orders WHERE id = ?`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const [deliveries] = await conn.query(
      `SELECT id FROM credit_order_deliveries WHERE order_id = ?`,
      [id]
    );
    for (const d of deliveries) {
      await conn.query(`DELETE FROM credit_order_delivery_items WHERE delivery_id = ?`, [d.id]);
    }
    await conn.query(`DELETE FROM credit_order_deliveries WHERE order_id = ?`, [id]);
    const [returns] = await conn.query(
      `SELECT id FROM credit_order_returns WHERE order_id = ?`,
      [id]
    );
    for (const r of returns) {
      await conn.query(`DELETE FROM credit_order_return_items WHERE return_id = ?`, [r.id]);
    }
    await conn.query(`DELETE FROM credit_order_returns WHERE order_id = ?`, [id]);
    await conn.query(`DELETE FROM credit_order_workflow WHERE order_id = ?`, [id]);
    await conn.query(`DELETE FROM credit_order_audit WHERE order_id = ?`, [id]);
    await conn.query(
      `DELETE FROM customer_ledger WHERE reference_type IN ('credit_order','credit_order_delivery') AND reference_id IN (
         SELECT id FROM credit_order_deliveries WHERE order_id = ?
         UNION ALL
         SELECT ? AS id
       )`,
      [id, id]
    );
    await conn.query(
      `DELETE FROM customer_ledger WHERE reference_type = 'credit_order' AND reference_id = ?`,
      [id]
    );
    await conn.query(`DELETE FROM credit_order_items WHERE order_id = ?`, [id]);
    await conn.query(`DELETE FROM credit_orders WHERE id = ?`, [id]);
    await conn.query(
      `UPDATE customers
       SET current_balance = COALESCE(
         (SELECT SUM(debit_amount) - SUM(credit_amount) FROM customer_ledger WHERE customer_id = ?),
         0),
           updated_at = NOW()
       WHERE id = ?`,
      [order.customer_id, order.customer_id]
    );
    await conn.commit();
    return { ok: true, deleted: order.order_number };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
