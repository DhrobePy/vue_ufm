import { h as defineEventHandler, v as getRouterParam, w as getUserSession, q as getRequestHeader, e as createError, n as getDb, a as auditLog } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1;
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can delete orders" });
  }
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order ID" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_deletion_log (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        order_id           INT NOT NULL,
        order_number       VARCHAR(50) NOT NULL,
        customer_id        INT,
        customer_name      VARCHAR(200),
        total_amount       DECIMAL(15,2),
        amount_paid        DECIMAL(15,2),
        balance_due        DECIMAL(15,2),
        order_status       VARCHAR(50),
        deleted_by_user_id INT,
        deleted_by_name    VARCHAR(200),
        deleted_at         DATETIME,   -- set explicitly to UTC_TIMESTAMP() on insert
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    const [[order]] = await conn.query(
      `SELECT o.id, o.customer_id, o.order_number,
              o.total_amount, o.amount_paid, o.balance_due,
              CASE WHEN o.status = 'delivered' AND o.balance_due = 0
                   THEN 'completed' ELSE o.status END AS order_status,
              c.name AS customer_name,
              u.display_name AS deleted_by_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = ?
       WHERE o.id = ?`,
      [userId, id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const auditAmt = Number(order.total_amount).toLocaleString();
    await auditLog(conn, {
      userId,
      action: "order_deleted",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `Order ${order.order_number} deleted \u2014 ${order.customer_name} \xB7 \u09F3${auditAmt} \xB7 status was ${order.order_status}`,
      severity: "critical",
      ipAddress
    });
    await conn.query(
      `INSERT INTO order_deletion_log
         (order_id, order_number, customer_id, customer_name,
          total_amount, amount_paid, balance_due, order_status,
          deleted_by_user_id, deleted_by_name, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        id,
        order.order_number,
        order.customer_id,
        order.customer_name,
        order.total_amount,
        order.amount_paid,
        order.balance_due,
        order.order_status,
        userId,
        (_g = order.deleted_by_name) != null ? _g : null
      ]
    );
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
      `DELETE FROM customer_ledger
       WHERE reference_type IN ('credit_order','credit_order_delivery')
         AND reference_id IN (
           SELECT id FROM credit_order_deliveries WHERE order_id = ?
           UNION ALL SELECT ? AS id
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
         (SELECT SUM(debit_amount) - SUM(credit_amount)
          FROM customer_ledger WHERE customer_id = ?),
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
