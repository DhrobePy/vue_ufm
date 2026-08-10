import { q as defineEventHandler, X as getUserSession, m as createError, a1 as isAdminRole, R as getRouterParam, as as readBody, z as getDb, E as getGLAccountId, al as postJournalEntry, g as auditLog } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAdminRole(role)) throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const userId = Number(session.user.id);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const items = (_b = body == null ? void 0 : body.items) != null ? _b : [];
  const discount = Number((_c = body == null ? void 0 : body.discount) != null ? _c : 0);
  const cashAmountIn = (body == null ? void 0 : body.cash_amount) !== void 0 ? Number(body.cash_amount) : null;
  const creditAmountIn = (body == null ? void 0 : body.credit_amount) !== void 0 ? Number(body.credit_amount) : null;
  const reason = String((_d = body == null ? void 0 : body.reason) != null ? _d : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "A reason is required for any correction" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT * FROM orders WHERE id = ? AND order_type = 'POS' FOR UPDATE`,
      [id]
    );
    if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
    const [existingItems] = await conn.query(`SELECT * FROM order_items WHERE order_id = ?`, [id]);
    const existingById = new Map(existingItems.map((i) => [i.id, i]));
    let newSubtotal = 0;
    for (const it of items) {
      const existing = existingById.get(it.item_id);
      if (!existing) throw createError({ statusCode: 400, statusMessage: `Line item ${it.item_id} does not belong to this order` });
      const qty = Number(it.quantity), price = Number(it.unit_price);
      if (qty <= 0 || price < 0) throw createError({ statusCode: 400, statusMessage: "Quantity must be positive and price non-negative" });
      const lineTotal = qty * price;
      newSubtotal += lineTotal;
      await conn.query(`UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`, [existing.quantity, existing.variant_id]);
      await conn.query(`UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`, [qty, existing.variant_id]);
      await conn.query(
        `UPDATE order_items SET quantity = ?, unit_price = ?, subtotal = ?, total_amount = ? WHERE id = ?`,
        [qty, price, lineTotal, lineTotal, it.item_id]
      );
    }
    const newTotal = Math.max(0, newSubtotal - discount);
    const newCredit = creditAmountIn !== null ? Math.max(0, Math.min(creditAmountIn, newTotal)) : Math.min(Number(order.credit_amount), newTotal);
    const newCash = cashAmountIn !== null ? Math.max(0, cashAmountIn) : newTotal - newCredit;
    if (Math.abs(newCash + newCredit - newTotal) > 0.01)
      throw createError({ statusCode: 400, statusMessage: `Cash + Credit must equal the new total (\u09F3${newTotal.toLocaleString()})` });
    const paymentStatus = newCredit <= 5e-3 ? "Paid" : newCash <= 5e-3 ? "Unpaid" : "Partial";
    await conn.query(
      `UPDATE orders SET subtotal = ?, discount_amount = ?, total_amount = ?, cash_amount = ?, credit_amount = ?, payment_status = ?, updated_at = NOW() WHERE id = ?`,
      [newSubtotal, discount, newTotal, newCash, newCredit, paymentStatus, id]
    );
    await conn.query(`DELETE FROM pos_customer_ledger WHERE order_id = ? AND transaction_type = 'sale'`, [id]);
    if (newCredit > 5e-3 && order.customer_id) {
      await conn.query(
        `INSERT INTO pos_customer_ledger (customer_id, order_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, created_by_user_id)
         VALUES (?, ?, CURDATE(), 'sale', ?, ?, 0, ?, ?)`,
        [order.customer_id, id, `POS sale ${order.order_number} (corrected)`, newCredit, order.order_number, userId]
      );
    }
    let newJeId = null;
    if (order.journal_entry_id) {
      const [oldLines] = await conn.query(
        `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
        [order.journal_entry_id]
      );
      const [revRes] = await conn.query(
        `INSERT INTO journal_entries (transaction_date, description, reverses_entry_id, related_document_type, created_by_user_id)
         VALUES (CURDATE(), ?, ?, 'PosOrderCorrection', ?)`,
        [`REVERSAL: POS sale ${order.order_number} correction \u2014 ${reason}`.slice(0, 255), order.journal_entry_id, userId]
      );
      for (const l of oldLines) {
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount) VALUES (?, ?, ?, ?)`,
          [revRes.insertId, l.account_id, Number(l.credit_amount), Number(l.debit_amount)]
        );
      }
      await conn.query(`UPDATE journal_entries SET is_reversed = 1 WHERE id = ?`, [order.journal_entry_id]);
      const jeLines = [];
      let paidAccountId = null;
      if (newCash > 5e-3) {
        if (order.payment_method === "Cash" && order.cash_account_id) {
          const [[ca]] = await conn.query(`SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [order.cash_account_id]);
          paidAccountId = (_e = ca == null ? void 0 : ca.chart_of_account_id) != null ? _e : null;
        } else if (order.bank_account_id) {
          const [[ba]] = await conn.query(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [order.bank_account_id]);
          paidAccountId = (_f = ba == null ? void 0 : ba.chart_of_account_id) != null ? _f : null;
        }
        if (paidAccountId) jeLines.push({ accountId: paidAccountId, debit: newCash, credit: 0 });
      }
      let arId = null;
      if (newCredit > 5e-3) {
        arId = await getGLAccountId(conn, "Accounts Receivable");
        if (arId) jeLines.push({ accountId: arId, debit: newCredit, credit: 0 });
      }
      const revenueId = await getGLAccountId(conn, "Revenue");
      if (revenueId && jeLines.length) {
        jeLines.push({ accountId: revenueId, debit: 0, credit: newTotal });
        newJeId = await postJournalEntry(conn, {
          date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          description: `POS sale ${order.order_number} (corrected \u2014 ${reason})`,
          docType: "PosOrder",
          docId: id,
          userId,
          lines: jeLines
        });
      }
      await conn.query(`UPDATE orders SET journal_entry_id = ? WHERE id = ?`, [newJeId, id]);
    }
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "other",
      recordType: "pos_order",
      recordId: id,
      referenceNumber: order.order_number,
      description: `POS sale ${order.order_number} corrected \u2014 ${reason} (new total \u09F3${newTotal.toLocaleString()})`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, total_amount: newTotal, cash_amount: newCash, credit_amount: newCredit };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
