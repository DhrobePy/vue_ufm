import { q as defineEventHandler, at as readBody, X as getUserSession, m as createError, z as getDb, a6 as nextDocNumber, ao as postPurchasePaymentJE, g as auditLog } from '../../../nitro/nitro.mjs';
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

const payments_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
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
    payment_type = "credit",
    // advance | credit | against_delivery | contra
    remarks
  } = body != null ? body : {};
  if (!purchase_order_id || !amount_paid || Number(amount_paid) <= 0) {
    throw createError({ statusCode: 400, statusMessage: "purchase_order_id and amount_paid are required" });
  }
  const isContra = payment_type === "contra";
  if (isContra && !reference_number) {
    throw createError({ statusCode: 400, statusMessage: "Contra payment requires a sales invoice reference (order_number)" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  const pmtDate = payment_date != null ? payment_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const pmtAmt = Number(amount_paid);
  try {
    await conn.beginTransaction();
    const [[po]] = await conn.query(
      `SELECT id, po_number, supplier_id, supplier_name, balance_payable
       FROM purchase_orders_adnan WHERE id = ?`,
      [purchase_order_id]
    );
    if (!po) throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
    let bankName = null;
    let bankGlAccountId = null;
    if (bank_account_id) {
      const [[ba]] = await conn.query(
        `SELECT bank_name, chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [bank_account_id]
      );
      bankName = (_c = ba == null ? void 0 : ba.bank_name) != null ? _c : null;
      bankGlAccountId = (_d = ba == null ? void 0 : ba.chart_of_account_id) != null ? _d : null;
    }
    const voucherNo = await nextDocNumber(conn, "PV", "purchase_payments_adnan", "payment_voucher_number");
    const [result] = await conn.query(
      `INSERT INTO purchase_payments_adnan
         (payment_voucher_number, payment_date, purchase_order_id, po_number,
          supplier_id, supplier_name, amount_paid, payment_method,
          bank_account_id, bank_name, reference_number,
          payment_type, is_posted, remarks, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        voucherNo,
        pmtDate,
        purchase_order_id,
        po.po_number,
        po.supplier_id,
        po.supplier_name,
        pmtAmt,
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
      [pmtAmt, pmtAmt, pmtAmt, purchase_order_id]
    );
    if (isContra && reference_number) {
      const [[creditOrder]] = await conn.query(
        `SELECT id, customer_id, balance_due, amount_paid
         FROM credit_orders
         WHERE order_number = ? OR id = ?
         LIMIT 1`,
        [String(reference_number), Number(reference_number) || 0]
      );
      if (creditOrder) {
        const newCrPaid = Number((_e = creditOrder.amount_paid) != null ? _e : 0) + pmtAmt;
        const newCrBalance = Math.max(0, Number((_f = creditOrder.balance_due) != null ? _f : 0) - pmtAmt);
        const crPayNo = await nextDocNumber(conn, "PAY", "customer_payments", "payment_number");
        const [crRes] = await conn.query(
          `INSERT INTO customer_payments
             (order_id, payment_number, customer_id, payment_date, amount,
              payment_method, payment_type, reference_number,
              allocation_status, allocated_amount, notes, created_by_user_id)
           VALUES (?, ?, ?, ?, ?,
                   'Contra / Purchase Offset', 'contra_offset', ?,
                   'allocated', ?, ?, ?)`,
          [
            creditOrder.id,
            crPayNo,
            creditOrder.customer_id,
            pmtDate,
            pmtAmt,
            voucherNo,
            // reference = the PV voucher number
            pmtAmt,
            `Contra offset \u2014 purchase payment ${voucherNo} set-off against sales order`,
            userId
          ]
        );
        const crPaymentId = crRes.insertId;
        await conn.query(
          `UPDATE credit_orders
           SET amount_paid = ?, balance_due = ?, updated_at = NOW()
           WHERE id = ?`,
          [newCrPaid, newCrBalance, creditOrder.id]
        );
        await conn.query(
          `UPDATE customers
           SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW()
           WHERE id = ?`,
          [pmtAmt, creditOrder.customer_id]
        );
        const [[lastLedger]] = await conn.query(
          `SELECT COALESCE(balance_after, 0) AS bal
           FROM customer_ledger WHERE customer_id = ?
           ORDER BY created_at DESC, id DESC LIMIT 1`,
          [creditOrder.customer_id]
        );
        const newLedgerBal = Math.max(0, Number((_g = lastLedger == null ? void 0 : lastLedger.bal) != null ? _g : 0) - pmtAmt);
        await conn.query(
          `INSERT INTO customer_ledger
             (customer_id, transaction_date, transaction_type, reference_type, reference_id,
              invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
           VALUES (?, ?, 'payment', 'customer_payment', ?,
                   ?, ?, 0, ?, ?, ?)`,
          [
            creditOrder.customer_id,
            pmtDate,
            crPaymentId,
            crPayNo.slice(0, 50),
            `Contra offset \u2014 ${voucherNo} purchase payment set-off against ${reference_number}`,
            pmtAmt,
            newLedgerBal,
            userId
          ]
        );
      } else {
        console.warn(
          `[purchase/payments] Contra ref '${reference_number}' not found in credit_orders \u2014 purchase-side settled, credit-sales side NOT updated`
        );
      }
    }
    try {
      await postPurchasePaymentJE(conn, {
        paymentId,
        pmtDate,
        voucherNo,
        paymentType: payment_type,
        pmtAmt,
        supplierName: po.supplier_name,
        bankName,
        paymentMethod: payment_method,
        referenceNumber: reference_number,
        bankGlAccountId,
        userId
      });
    } catch (jeErr) {
      console.warn(`[purchase/payments] JE creation failed for ${voucherNo}:`, jeErr == null ? void 0 : jeErr.message);
    }
    const bankNote = bankName ? ` via ${bankName}` : "";
    const refNote = reference_number ? ` \xB7 ref: ${reference_number}` : "";
    const typeLabel = (_h = { advance: " [Advance]", against_delivery: " [Delivery Exp]", contra: " [Contra]", credit: "" }[payment_type]) != null ? _h : "";
    await auditLog(conn, {
      userId,
      action: "payment_made",
      module: "purchase",
      recordType: "purchase_payment",
      recordId: paymentId,
      referenceNumber: voucherNo,
      description: `Payment ${voucherNo}${typeLabel}: \u09F3${pmtAmt.toLocaleString()} to ${po.supplier_name} \xB7 PO ${po.po_number}${bankNote}${refNote}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: paymentId, voucher_number: voucherNo };
  } catch (e) {
    await conn.rollback();
    console.error("[purchase/payments] Transaction failed:", e == null ? void 0 : e.message);
    throw createError({
      statusCode: 500,
      statusMessage: (_j = (_i = e == null ? void 0 : e.sqlMessage) != null ? _i : e == null ? void 0 : e.message) != null ? _j : "Payment recording failed"
    });
  } finally {
    conn.release();
  }
});

export { payments_post as default };
//# sourceMappingURL=payments.post.mjs.map
