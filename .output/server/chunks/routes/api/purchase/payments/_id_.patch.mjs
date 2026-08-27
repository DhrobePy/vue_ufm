import { q as defineEventHandler, R as getRouterParam, m as createError, au as readBody, X as getUserSession, z as getDb, aK as reversePurchasePaymentJE, ap as postPurchasePaymentJE, ax as recalcPO, g as auditLog } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (role !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Only a Superadmin can edit a purchase payment" });
  const {
    payment_date,
    amount_paid,
    payment_method,
    payment_type,
    bank_account_id,
    reference_number,
    handled_by_employee,
    remarks
  } = body != null ? body : {};
  if (!payment_date || !amount_paid)
    throw createError({ statusCode: 400, statusMessage: "payment_date and amount_paid are required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[pmt]] = await conn.query(
      `SELECT id, payment_voucher_number, purchase_order_id, journal_entry_id,
              amount_paid AS old_amount, supplier_name, is_posted
       FROM purchase_payments_adnan WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    let newJeId = null;
    if (pmt.is_posted && pmt.journal_entry_id) {
      await reversePurchasePaymentJE(conn, {
        journalEntryId: pmt.journal_entry_id,
        pmtDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        voucherNo: pmt.payment_voucher_number,
        reason: "payment edited",
        userId,
        paymentId: id
      });
    }
    await conn.query(
      `UPDATE purchase_payments_adnan
       SET payment_date        = ?,
           amount_paid         = ?,
           payment_method      = ?,
           payment_type        = ?,
           bank_account_id     = ?,
           reference_number    = ?,
           handled_by_employee = ?,
           remarks             = ?,
           updated_at          = NOW()
       WHERE id = ?`,
      [
        payment_date,
        Number(amount_paid),
        payment_method != null ? payment_method : "cash",
        payment_type != null ? payment_type : "regular",
        bank_account_id != null ? bank_account_id : null,
        reference_number != null ? reference_number : null,
        handled_by_employee != null ? handled_by_employee : null,
        remarks != null ? remarks : null,
        id
      ]
    );
    if (pmt.is_posted) {
      let bankGlAccountId = null;
      let bankName = null;
      if (bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT bank_name, chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)]
        );
        bankGlAccountId = (_e = ba == null ? void 0 : ba.chart_of_account_id) != null ? _e : null;
        bankName = (_f = ba == null ? void 0 : ba.bank_name) != null ? _f : null;
      }
      try {
        newJeId = await postPurchasePaymentJE(conn, {
          paymentId: id,
          pmtDate: payment_date,
          voucherNo: pmt.payment_voucher_number,
          paymentType: payment_type != null ? payment_type : "regular",
          pmtAmt: Number(amount_paid),
          supplierName: pmt.supplier_name,
          bankName,
          paymentMethod: payment_method != null ? payment_method : "cash",
          referenceNumber: reference_number,
          bankGlAccountId,
          userId
        });
      } catch (jeErr) {
        console.warn(`[purchase/payments] Re-post JE failed for ${pmt.payment_voucher_number}:`, jeErr == null ? void 0 : jeErr.message);
      }
    }
    await recalcPO(conn, pmt.purchase_order_id);
    const amtChange = Number(amount_paid) !== Number(pmt.old_amount) ? ` \xB7 Amount: \u09F3${Number(pmt.old_amount).toLocaleString()} \u2192 \u09F3${Number(amount_paid).toLocaleString()}` : ` \xB7 \u09F3${Number(amount_paid).toLocaleString()}`;
    await auditLog(conn, {
      userId,
      action: "payment_updated",
      module: "purchase",
      recordType: "purchase_payment",
      recordId: id,
      referenceNumber: pmt.payment_voucher_number,
      description: `Payment ${pmt.payment_voucher_number} updated${amtChange}${newJeId ? ` \xB7 JE re-posted (#${newJeId})` : ""}`,
      severity: amtChange.includes("\u2192") ? "warning" : "info"
    });
    await conn.commit();
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} updated` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
