import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const reverse_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admin/superadmin can reverse payments" });
  }
  const { payment_id, reason } = body != null ? body : {};
  if (!payment_id) throw createError({ statusCode: 400, statusMessage: "payment_id is required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[pmt]] = await conn.query(
      `SELECT p.*, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ?`,
      [payment_id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    if (((_e = pmt.notes) != null ? _e : "").startsWith("REVERSED")) {
      throw createError({ statusCode: 409, statusMessage: "Payment already reversed" });
    }
    const pmtAmount = Number(pmt.amount);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    await conn.query(
      `UPDATE customer_payments
       SET notes = CONCAT('REVERSED on ', ?, ' \u2014 ', COALESCE(?, 'No reason given'), IF(notes IS NOT NULL, CONCAT(' | Orig: ', notes), '')),
           allocation_status = 'unallocated', updated_at = NOW()
       WHERE id = ?`,
      [today, reason != null ? reason : null, payment_id]
    );
    const [[lastLedger]] = await conn.query(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [pmt.customer_id]
    );
    const prevBal = Number((_f = lastLedger == null ? void 0 : lastLedger.bal) != null ? _f : 0);
    const newBal = prevBal + pmtAmount;
    const refNo = `REV-${(_g = pmt.reference_number) != null ? _g : pmt.id}`;
    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'debit_note', 'payment_reversal', ?, ?, ?, ?, 0, ?, ?)`,
      [
        pmt.customer_id,
        today,
        payment_id,
        refNo,
        `Payment Reversal \u2014 ${refNo}${reason ? ` (${reason})` : ""}`,
        pmtAmount,
        newBal,
        userId
      ]
    );
    await conn.query(
      `UPDATE customers SET current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?`,
      [pmtAmount, pmt.customer_id]
    );
    if (pmt.allocated_to_invoices) {
      try {
        const invoices = JSON.parse(pmt.allocated_to_invoices);
        for (const inv of invoices) {
          if (inv.order_id) {
            await conn.query(
              `UPDATE credit_orders
               SET balance_due  = balance_due  + ?,
                   amount_paid  = GREATEST(0, amount_paid - ?),
                   updated_at   = NOW()
               WHERE id = ?`,
              [pmtAmount, pmtAmount, inv.order_id]
            );
          }
        }
      } catch {
      }
    }
    await conn.commit();
    return { ok: true, reversed_amount: pmtAmount, reference: refNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { reverse_post as default };
//# sourceMappingURL=reverse.post.mjs.map
