import { t as defineEventHandler, Y as getRouterParam, a2 as getUserSession, p as createError, aC as readBody, F as getDb, aJ as recycleBegin, aI as recycleArchiveDelete, aN as recycleSnapshotBefore, b1 as transitionOrder, aK as recycleFinalize, i as auditLog, aY as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const reverseDispatch_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = String((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin can reverse a dispatch" });
  const reason = String((_d = (_c = await readBody(event)) == null ? void 0 : _c.reason) != null ? _d : "").trim();
  if (reason.length < 5) throw createError({ statusCode: 400, statusMessage: "A reason (at least 5 characters) is required" });
  const refuse = (m) => {
    throw createError({ statusCode: 409, statusMessage: m });
  };
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(`SELECT * FROM credit_orders WHERE id = ? FOR UPDATE`, [id]);
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    if (order.status !== "goods_on_board") refuse(`Only an order that is Goods on Board can be reversed (this one is "${order.status}")`);
    if (order.is_other_sales) refuse("Other-Sales orders post COGS and stock drawdown at dispatch, which this reversal does not undo");
    if (Number(order.amount_paid) > 5e-3 || Number(order.advance_paid) > 5e-3)
      refuse("A payment/advance is recorded against this order \u2014 reversing the invoice would orphan it");
    const count = async (sql) => {
      var _a2, _b2;
      return Number((_b2 = (_a2 = (await conn.query(sql, [id]))[0][0]) == null ? void 0 : _a2.c) != null ? _b2 : 0);
    };
    if (await count(`SELECT COUNT(*) c FROM payment_allocations WHERE order_id = ?`)) refuse("Payments are allocated to this order");
    if (await count(`SELECT COUNT(*) c FROM cr_delivery_confirmations WHERE order_id = ?`)) refuse("A gate scan / delivery confirmation exists \u2014 the truck may already have left");
    if (await count(`SELECT COUNT(*) c FROM credit_order_deliveries WHERE order_id = ?`)) refuse("Deliveries are recorded for this order");
    if (await count(`SELECT COUNT(*) c FROM credit_order_returns WHERE order_id = ?`)) refuse("A return exists for this order");
    const [[ship]] = await conn.query(`SELECT trip_id FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id]);
    if (ship == null ? void 0 : ship.trip_id) refuse("This order is assigned to a trip \u2014 remove it from the trip first");
    const [ledger] = await conn.query(
      `SELECT * FROM customer_ledger WHERE reference_type IN ('credit_order','credit_orders') AND reference_id = ? AND transaction_type = 'invoice'`,
      [id]
    );
    if (ledger.length !== 1) refuse(`Expected exactly one invoice ledger row (found ${ledger.length}) \u2014 not safe to reverse automatically`);
    const led = ledger[0];
    const [[latest]] = await conn.query(`SELECT MAX(id) m FROM customer_ledger WHERE customer_id = ?`, [order.customer_id]);
    if (Number(latest.m) !== Number(led.id))
      refuse("Later ledger entries exist for this customer (payments, invoices or adjustments) \u2014 use an Order Amendment credit note instead");
    const jeId = led.journal_entry_id ? Number(led.journal_entry_id) : null;
    const batch = await recycleBegin(conn, {
      entityType: "dispatch_reversal",
      label: `Dispatch invoice reversal \u2014 ${order.order_number}`,
      customerId: order.customer_id,
      userId,
      userName: String((_e = session.user.name) != null ? _e : `User ${userId}`)
    });
    await recycleArchiveDelete(conn, batch, "customer_ledger", "id", led.id);
    if (jeId) {
      await recycleArchiveDelete(conn, batch, "transaction_lines", "journal_entry_id", jeId);
      await recycleArchiveDelete(conn, batch, "journal_entries", "id", jeId);
    }
    await recycleSnapshotBefore(conn, batch, "customers", "id", order.customer_id);
    await recycleSnapshotBefore(conn, batch, "credit_orders", "id", id);
    const [[agg]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount),0) d, COALESCE(SUM(credit_amount),0) c FROM customer_ledger WHERE customer_id = ?`,
      [order.customer_id]
    );
    const newBalance = Number(agg.d) - Number(agg.c);
    await conn.query(`UPDATE customers SET current_balance = ?, updated_at = NOW() WHERE id = ?`, [newBalance, order.customer_id]);
    await transitionOrder(conn, {
      orderId: id,
      from: "goods_on_board",
      to: "ready_to_ship",
      action: "dispatch_reversed",
      userId,
      comment: `Dispatch reversed \u2014 reason: ${reason}. Invoice archived in Recycle Bin batch #${batch}; customer balance now \u09F3${newBalance.toLocaleString()}.`
    });
    await recycleFinalize(conn, batch);
    await auditLog(conn, {
      userId,
      action: "status_changed",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: id,
      referenceNumber: order.order_number,
      severity: "critical",
      description: `Dispatch of ${order.order_number} REVERSED \u2192 Ready to Ship (Recycle Bin batch #${batch}) \u2014 ${reason}`
    });
    await conn.commit();
    sendTelegram(`\u21A9\uFE0F <b>DISPATCH REVERSED</b>
${order.order_number}
Reason: ${reason}
Back at Ready to Ship`, "orders");
    return { ok: true, batch, newBalance };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    throw createError({ statusCode: 500, statusMessage: (_g = (_f = e == null ? void 0 : e.sqlMessage) != null ? _f : e == null ? void 0 : e.message) != null ? _g : "Reversal failed" });
  } finally {
    conn.release();
  }
});

export { reverseDispatch_post as default };
//# sourceMappingURL=reverse-dispatch.post.mjs.map
