import { p as defineEventHandler, am as readBody, V as getUserSession, l as createError, y as getDb, _ as isAdminRole, Q as getUserActionLimit, a3 as nextDocNumber, C as getGLAccountId, ag as postJournalEntry, f as auditLog } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const VALID_METHODS = ["Cash", "Card", "Bank Transfer", "bKash", "Nagad"];
const DB_METHOD = {
  Cash: "Cash",
  Card: "Card",
  "Bank Transfer": "Bank Transfer",
  bKash: "Mobile Banking",
  Nagad: "Mobile Banking"
};
const complete_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const {
    branch_id = 1,
    customer_id = null,
    items = [],
    // [{ variant_id, quantity, unit_price }]
    discount = 0,
    payment_method = "Cash",
    // tender type for the "paid now" portion
    cash_amount = null,
    // defaults to full total when omitted (back-compat)
    credit_amount = 0,
    cash_account_id = null,
    bank_account_id = null,
    payment_reference = null
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) throw createError({ statusCode: 400, statusMessage: "No items in cart" });
  if (!VALID_METHODS.includes(payment_method))
    throw createError({ statusCode: 400, statusMessage: "Invalid payment method" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));
    const creditAmt = Math.max(0, Math.min(Number(credit_amount) || 0, total));
    const cashAmt = cash_amount !== null ? Math.max(0, Number(cash_amount)) : total - creditAmt;
    if (Math.abs(cashAmt + creditAmt - total) > 0.01)
      throw createError({ statusCode: 400, statusMessage: `Cash (\u09F3${cashAmt}) + Credit (\u09F3${creditAmt}) must equal the total (\u09F3${total})` });
    if (creditAmt > 0 && !customer_id)
      throw createError({ statusCode: 400, statusMessage: "A customer is required for any credit portion of a sale" });
    let customer = null;
    if (customer_id) {
      const [[c]] = await conn.query(`SELECT id, name FROM customers WHERE id = ?`, [customer_id]);
      customer = c;
    }
    const dbMethod = creditAmt >= total - 5e-3 ? "Credit" : DB_METHOD[payment_method];
    let exitStatus = "cleared";
    if (creditAmt > 5e-3 && !isAdminRole(role)) {
      const cap = await getUserActionLimit(conn, userId, "pos_exit_release");
      exitStatus = cap !== null && creditAmt <= cap ? "cleared" : "pending_approval";
    }
    const orderNumber = await nextDocNumber(conn, "ORD", "orders", "order_number");
    const paymentStatus = creditAmt <= 5e-3 ? "Paid" : cashAmt <= 5e-3 ? "Unpaid" : "Partial";
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_number, branch_id, customer_id, order_date, order_type,
          subtotal, discount_amount, total_amount,
          cash_amount, credit_amount, payment_method, payment_reference,
          cash_account_id, bank_account_id,
          payment_status, order_status, exit_status,
          exit_cleared_by_user_id, exit_cleared_at,
          exit_requested_by_user_id, exit_requested_at,
          created_by_user_id)
       VALUES (?, ?, ?, NOW(), 'POS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        branch_id,
        customer_id || null,
        subtotal,
        Number(discount || 0),
        total,
        cashAmt,
        creditAmt,
        dbMethod,
        payment_reference || null,
        cash_account_id || null,
        bank_account_id || null,
        paymentStatus,
        exitStatus,
        exitStatus === "cleared" ? userId : null,
        exitStatus === "cleared" ? /* @__PURE__ */ new Date() : null,
        exitStatus === "pending_approval" ? userId : null,
        exitStatus === "pending_approval" ? /* @__PURE__ */ new Date() : null,
        userId
      ]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const lineTotal = Number(item.unit_price) * Number(item.quantity);
      await conn.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, unit_price, subtotal, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.variant_id, item.quantity, item.unit_price, lineTotal, lineTotal]
      );
      await conn.query(
        `UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`,
        [item.quantity, item.variant_id]
      );
    }
    const jeLines = [];
    let paidAccountId = null;
    if (cashAmt > 5e-3) {
      if (payment_method === "Cash" && cash_account_id) {
        const [[ca]] = await conn.query(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [cash_account_id]
        );
        paidAccountId = (_c = ca == null ? void 0 : ca.chart_of_account_id) != null ? _c : null;
      } else if (bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [bank_account_id]
        );
        paidAccountId = (_d = ba == null ? void 0 : ba.chart_of_account_id) != null ? _d : null;
      }
      if (paidAccountId) jeLines.push({ accountId: paidAccountId, debit: cashAmt, credit: 0, memo: orderNumber });
    }
    let arId = null;
    if (creditAmt > 5e-3) {
      arId = await getGLAccountId(conn, "Accounts Receivable");
      if (arId) jeLines.push({ accountId: arId, debit: creditAmt, credit: 0, memo: orderNumber });
    }
    const revId = await getGLAccountId(conn, "Revenue");
    let jeId = null;
    if (revId && jeLines.length && Math.abs(jeLines.reduce((s, l) => s + l.debit, 0) - total) < 0.01) {
      jeLines.push({ accountId: revId, debit: 0, credit: total, memo: orderNumber });
      jeId = await postJournalEntry(conn, {
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        description: `POS sale ${orderNumber}${customer ? ` \u2014 ${customer.name}` : " \u2014 walk-in"}`,
        docType: "PosOrder",
        docId: orderId,
        userId,
        lines: jeLines
      });
      await conn.query(`UPDATE orders SET journal_entry_id = ? WHERE id = ?`, [jeId, orderId]);
      if (payment_method === "Cash" && cash_account_id && cashAmt > 5e-3) {
        const [[pcAcc]] = await conn.query(
          `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [cash_account_id]
        );
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_in', ?, ?, 'pos_order', ?, ?, ?, CURDATE())`,
          [
            cash_account_id,
            (_e = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _e : branch_id,
            cashAmt,
            Number((_f = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _f : 0) + cashAmt,
            orderId,
            `POS sale ${orderNumber}`,
            userId
          ]
        );
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
          [cashAmt, cash_account_id]
        );
      }
    } else {
      console.warn(`[pos/complete] Skipping JE for ${orderNumber}: lines=${jeLines.length}, rev=${revId}`);
    }
    if (creditAmt > 5e-3 && customer_id) {
      await conn.query(
        `INSERT INTO pos_customer_ledger
           (customer_id, order_id, transaction_date, transaction_type, description,
            debit_amount, credit_amount, reference_number, created_by_user_id)
         VALUES (?, ?, CURDATE(), 'sale', ?, ?, 0, ?, ?)`,
        [customer_id, orderId, `POS sale ${orderNumber}`, creditAmt, orderNumber, userId]
      );
    }
    await auditLog(conn, {
      userId,
      action: "created",
      module: "other",
      recordType: "pos_order",
      recordId: orderId,
      referenceNumber: orderNumber,
      description: `POS sale ${orderNumber} \u2014 \u09F3${total.toLocaleString()} (cash \u09F3${cashAmt.toLocaleString()} / credit \u09F3${creditAmt.toLocaleString()})`,
      severity: "info"
    });
    await conn.commit();
    return {
      ok: true,
      order_number: orderNumber,
      order_id: orderId,
      total,
      cash_amount: cashAmt,
      credit_amount: creditAmt,
      exit_status: exitStatus
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { complete_post as default };
//# sourceMappingURL=complete.post.mjs.map
