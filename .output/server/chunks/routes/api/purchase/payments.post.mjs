import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb, a as auditLog } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const payments_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    purchase_order_id,
    payment_date,
    amount_paid,
    payment_method = "bank",
    bank_account_id,
    reference_number,
    payment_type = "regular",
    remarks
  } = body != null ? body : {};
  if (!purchase_order_id || !amount_paid || Number(amount_paid) <= 0) {
    throw createError({ statusCode: 400, statusMessage: "purchase_order_id and amount_paid are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`
      ALTER TABLE purchase_payments_adnan
        ADD COLUMN IF NOT EXISTS payment_type VARCHAR(30) DEFAULT 'credit'
    `).catch(() => {
    });
    const [[po]] = await conn.query(
      `SELECT id, po_number, supplier_id, supplier_name, balance_payable
       FROM purchase_orders_adnan WHERE id = ?`,
      [purchase_order_id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    let bankName = null;
    if (bank_account_id) {
      const [[ba]] = await conn.query(
        `SELECT bank_name FROM bank_accounts WHERE id = ?`,
        [bank_account_id]
      );
      bankName = (_c = ba == null ? void 0 : ba.bank_name) != null ? _c : null;
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM purchase_payments_adnan WHERE DATE(payment_date) = CURDATE()`
    );
    const seq = String(((_d = cnt.n) != null ? _d : 0) + 1).padStart(4, "0");
    const voucherNo = `PV-${today}-${seq}`;
    const [result] = await conn.query(
      `INSERT INTO purchase_payments_adnan
         (payment_voucher_number, payment_date, purchase_order_id, po_number,
          supplier_id, supplier_name, amount_paid, payment_method,
          bank_account_id, bank_name, reference_number,
          payment_type, remarks, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherNo,
        payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        purchase_order_id,
        po.po_number,
        po.supplier_id,
        po.supplier_name,
        Number(amount_paid),
        payment_method,
        bank_account_id ? Number(bank_account_id) : null,
        bankName,
        reference_number != null ? reference_number : null,
        payment_type,
        remarks != null ? remarks : null,
        userId
      ]
    );
    const paymentId = result.insertId;
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_paid      = COALESCE(total_paid, 0) + ?,
           balance_payable = GREATEST(0, COALESCE(balance_payable, 0) - ?),
           payment_status  = CASE
             WHEN GREATEST(0, COALESCE(balance_payable, 0) - ?) <= 0 THEN 'paid'
             ELSE 'partial'
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [Number(amount_paid), Number(amount_paid), Number(amount_paid), purchase_order_id]
    );
    const bankNote = bankName ? ` via ${bankName}` : "";
    const refNote = reference_number ? ` \xB7 Ref: ${reference_number}` : "";
    await auditLog(conn, {
      userId,
      action: "payment_made",
      module: "purchase",
      recordType: "purchase_payment",
      recordId: paymentId,
      referenceNumber: voucherNo,
      description: `Payment ${voucherNo} recorded: \u09F3${Number(amount_paid).toLocaleString()} to ${po.supplier_name} for PO ${po.po_number} \xB7 ${payment_method}${bankNote}${refNote}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: paymentId, voucher_number: voucherNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { payments_post as default };
//# sourceMappingURL=payments.post.mjs.map
