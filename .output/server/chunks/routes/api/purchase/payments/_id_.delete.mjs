import { J as defineEventHandler, ag as getRouterParam, C as createError, al as getUserSession, aZ as readBody, a1 as getDb, bi as reversePurchasePaymentJE, b4 as recycleBegin, b3 as recycleArchiveDelete, b5 as recycleFinalize, b0 as recalcPO, q as auditLog } from '../../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const userName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  const role = ((_h = (_g = session == null ? void 0 : session.user) == null ? void 0 : _g.role) != null ? _h : "").toLowerCase();
  if (role !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "Only a Superadmin can delete a purchase payment" });
  const reason = String((_j = (_i = await readBody(event).catch(() => null)) == null ? void 0 : _i.reason) != null ? _j : "").trim();
  if (!reason) throw createError({ statusCode: 400, statusMessage: "Enter a reason for deleting this payment" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[pmt]] = await conn.query(
      `SELECT id, payment_voucher_number, purchase_order_id, is_posted, journal_entry_id,
              amount_paid, supplier_name, remarks, cash_account_id
       FROM purchase_payments_adnan WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    if (pmt.is_posted) {
      let reversalJeId = null;
      if (pmt.journal_entry_id) {
        reversalJeId = await reversePurchasePaymentJE(conn, {
          journalEntryId: pmt.journal_entry_id,
          pmtDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          voucherNo: pmt.payment_voucher_number,
          reason: "payment deleted",
          userId,
          paymentId: id
        });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
      const jeNote = reversalJeId ? ` (JE reversed #${reversalJeId})` : pmt.journal_entry_id ? " (JE reversal FAILED \u2014 no lines found)" : "";
      const newNote = `
[DELETED: ${userName} @ ${now}${jeNote} \u2014 ${reason}]`;
      await conn.query(
        `UPDATE purchase_payments_adnan
         SET is_posted  = 0,
             remarks    = CONCAT(COALESCE(remarks, ''), ?),
             updated_at = NOW()
         WHERE id = ?`,
        [newNote, id]
      );
    } else {
      const batchId = await recycleBegin(conn, {
        entityType: "purchase_payment",
        label: pmt.payment_voucher_number,
        userId,
        userName
      });
      await recycleArchiveDelete(conn, batchId, "purchase_payments_adnan", "id", id);
      await recycleFinalize(conn, batchId);
    }
    if (pmt.is_posted && pmt.cash_account_id) await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [Number(pmt.amount_paid), pmt.cash_account_id]);
    await conn.query(`DELETE FROM supplier_balance_adjustments WHERE payment_id = ? AND type = 'debit'`, [id]);
    await recalcPO(conn, pmt.purchase_order_id);
    const typeNote = pmt.is_posted ? " (was posted \u2014 soft deleted)" : " (hard deleted)";
    await auditLog(conn, {
      userId,
      action: "payment_deleted",
      module: "purchase",
      recordType: "purchase_payment",
      recordId: id,
      referenceNumber: pmt.payment_voucher_number,
      description: `Payment ${pmt.payment_voucher_number} deleted by ${userName} \xB7 \u09F3${Number(pmt.amount_paid).toLocaleString()} to ${pmt.supplier_name}${typeNote} \xB7 reason: ${reason}`,
      severity: "warning"
    });
    await conn.commit();
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} deleted` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
