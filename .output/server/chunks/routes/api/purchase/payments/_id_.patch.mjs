import { j as defineEventHandler, C as getRouterParam, f as createError, _ as readBody, F as getUserSession, q as getDb, a2 as recalcPO, b as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
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
      `SELECT id, payment_voucher_number, purchase_order_id,
              amount_paid AS old_amount, supplier_name
       FROM purchase_payments_adnan WHERE id = ?`,
      [id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
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
    await recalcPO(conn, pmt.purchase_order_id);
    const amtChange = Number(amount_paid) !== Number(pmt.old_amount) ? ` \xB7 Amount: \u09F3${Number(pmt.old_amount).toLocaleString()} \u2192 \u09F3${Number(amount_paid).toLocaleString()}` : ` \xB7 \u09F3${Number(amount_paid).toLocaleString()}`;
    await auditLog(conn, {
      userId,
      action: "payment_updated",
      module: "purchase",
      recordType: "purchase_payment",
      recordId: id,
      referenceNumber: pmt.payment_voucher_number,
      description: `Payment ${pmt.payment_voucher_number} updated${amtChange}`,
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
