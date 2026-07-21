import { o as defineEventHandler, Q as getUserSession, k as createError, a as ADMIN_ROLES, G as getRequestHeader, af as readBody, x as getDb, _ as nextDocNumber, a9 as postGoodsOnBoardInvoice, B as getGLAccountId, aa as postJournalEntry, a8 as postCustomerLedger, e as auditLog, au as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const backdated_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Backdated order entry is admin/superadmin only" });
  const ipAddress = (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : getRequestHeader(event, "x-real-ip")) != null ? _d : void 0;
  const body = await readBody(event);
  const {
    customer_id,
    branch_id,
    transaction_date,
    // the historical date this sale actually happened
    delivery_address,
    notes,
    items,
    // [{ product_id, variant_id, qty_bags|quantity, unit_price, discount_amount }]
    amount_paid,
    // amount already collected at/around the time of sale (optional)
    payment_method,
    bank_account_id,
    cash_account_id,
    reference_number,
    cheque_number,
    cheque_date,
    bank_tx_type
  } = body != null ? body : {};
  if (!customer_id || !(items == null ? void 0 : items.length))
    throw createError({ statusCode: 400, statusMessage: "customer_id and items are required" });
  if (!transaction_date)
    throw createError({ statusCode: 400, statusMessage: "transaction_date is required" });
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (String(transaction_date) > today)
    throw createError({ statusCode: 400, statusMessage: "transaction_date cannot be in the future \u2014 use the normal order flow for that" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`,
      [customer_id]
    );
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id]
        );
        it.product_id = (_e = pv == null ? void 0 : pv.product_id) != null ? _e : null;
      }
    }
    let subtotal = 0;
    for (const it of items) {
      const qty = Number((_g = (_f = it.qty_bags) != null ? _f : it.quantity) != null ? _g : 0);
      if (qty <= 0) throw createError({ statusCode: 400, statusMessage: "Every line item needs a positive quantity" });
      subtotal += qty * Number(it.unit_price) - Number((_h = it.discount_amount) != null ? _h : 0);
    }
    const totalAmount = subtotal;
    const paidAmount = Math.max(0, Number(amount_paid != null ? amount_paid : 0));
    const balanceDue = Math.max(0, totalAmount - paidAmount);
    const orderNo = await nextDocNumber(conn, "CR", "credit_orders");
    const dispatchPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const deliveryPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const specialInstructions = `[BACKDATED ENTRY] ${notes != null ? notes : ""}`.trim();
    const [orderRes] = await conn.query(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, status,
          shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          delivery_type, mini_truck_surcharge,
          dispatch_pin, delivery_pin,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'delivered',
               ?, ?,
               ?, ?, ?, 0, ?,
               'big_truck', 0,
               ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id ? Number(branch_id) : null,
        transaction_date,
        delivery_address || null,
        specialInstructions,
        subtotal,
        totalAmount,
        paidAmount,
        balanceDue,
        dispatchPin,
        deliveryPin,
        userId
      ]
    );
    const orderId = orderRes.insertId;
    for (const it of items) {
      const qty = Number((_j = (_i = it.qty_bags) != null ? _i : it.quantity) != null ? _j : 0);
      const lineTotal = qty * Number(it.unit_price) - Number((_k = it.discount_amount) != null ? _k : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, (_l = it.variant_id) != null ? _l : null, qty, Number(it.unit_price), Number((_m = it.discount_amount) != null ? _m : 0), lineTotal]
      );
    }
    const delNo = await nextDocNumber(conn, "DEL", "credit_order_deliveries");
    const totalQty = items.reduce((s, i) => {
      var _a2, _b2;
      return s + Number((_b2 = (_a2 = i.qty_bags) != null ? _a2 : i.quantity) != null ? _b2 : 0);
    }, 0);
    const [delRes] = await conn.query(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [delNo, orderId, customer_id, transaction_date, totalQty, totalAmount, "Backdated entry \u2014 recorded outside normal pipeline", userId]
    );
    const deliveryId = delRes.insertId;
    for (const it of items) {
      const qty = Number((_o = (_n = it.qty_bags) != null ? _n : it.quantity) != null ? _o : 0);
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [deliveryId, it.product_id, (_p = it.variant_id) != null ? _p : null, qty, Number(it.unit_price), qty * Number(it.unit_price)]
      );
    }
    const wfComment = `Backdated entry \u2014 \u09F3${totalAmount.toLocaleString()} dated ${transaction_date}, recorded by ${userName} outside the normal pipeline${notes ? ` \xB7 ${notes}` : ""}`;
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', 'delivered', 'backdated_entry', ?, ?, NOW())`,
      [orderId, userId, wfComment]
    );
    const goResult = await postGoodsOnBoardInvoice(conn, {
      orderId,
      orderNumber: orderNo,
      customerId: customer_id,
      customerName: customer.name,
      totalAmount,
      balanceDue,
      userId,
      userName,
      postDate: transaction_date
    });
    let paymentNo = null;
    if (paidAmount > 0) {
      const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking", "Card"];
      const payMethod = validMethods.includes(payment_method) ? payment_method : "Cash";
      paymentNo = await nextDocNumber(conn, "PAY", "customer_payments");
      const [payRes] = await conn.query(
        `INSERT INTO customer_payments
           (order_id, payment_number, customer_id, payment_date, amount, payment_method,
            payment_type, reference_number, bank_account_id, cash_account_id,
            cheque_number, cheque_date, bank_transaction_type,
            allocation_status, allocated_amount, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, 'invoice_payment', ?, ?, ?, ?, ?, ?, 'allocated', ?, ?, ?)`,
        [
          orderId,
          paymentNo,
          customer_id,
          transaction_date,
          paidAmount,
          payMethod,
          reference_number || paymentNo,
          bank_account_id ? Number(bank_account_id) : null,
          cash_account_id ? Number(cash_account_id) : null,
          cheque_number || null,
          cheque_date || null,
          bank_tx_type || null,
          paidAmount,
          `Backdated entry \u2014 payment recorded at order entry (${payMethod})`,
          userId
        ]
      );
      const paymentId = payRes.insertId;
      let drAccountId = null;
      if (payMethod === "Cash" && cash_account_id) {
        const [[ca]] = await conn.query(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [Number(cash_account_id)]
        );
        drAccountId = (_q = ca == null ? void 0 : ca.chart_of_account_id) != null ? _q : null;
      } else if (["Bank Transfer", "Cheque", "Card", "Mobile Banking"].includes(payMethod) && bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)]
        );
        drAccountId = (_r = ba == null ? void 0 : ba.chart_of_account_id) != null ? _r : null;
      }
      const arId = await getGLAccountId(conn, "Accounts Receivable");
      let payJeId = null;
      if (drAccountId && arId) {
        payJeId = await postJournalEntry(conn, {
          date: transaction_date,
          description: `Payment received (backdated) \u2014 ${paymentNo} (Order ${orderNo})`,
          docType: "CustomerPayment",
          docId: paymentId,
          userId,
          lines: [
            { accountId: drAccountId, debit: paidAmount, credit: 0, memo: paymentNo },
            { accountId: arId, debit: 0, credit: paidAmount, memo: paymentNo }
          ]
        });
        await conn.query(`UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`, [payJeId, paymentId]);
        if (payMethod === "Cash" && cash_account_id) {
          const [[pcAcc]] = await conn.query(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(cash_account_id)]
          );
          const pcBal = Number((_s = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _s : 0);
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
            [
              Number(cash_account_id),
              (_t = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _t : null,
              paidAmount,
              pcBal + paidAmount,
              paymentId,
              `Backdated payment from order ${orderNo}`,
              userId,
              transaction_date
            ]
          );
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [paidAmount, Number(cash_account_id)]
          );
        }
      } else {
        console.warn(`[backdated] Skipping JE for ${paymentNo}: drAccountId=${drAccountId}, arId=${arId}`);
      }
      await postCustomerLedger(conn, {
        customerId: customer_id,
        date: transaction_date,
        transactionType: "payment",
        referenceType: "customer_payment",
        referenceId: paymentId,
        invoiceNumber: paymentNo,
        description: `Payment received \u2014 ${paymentNo} (backdated, Order ${orderNo}) via ${payMethod}`,
        debit: 0,
        credit: paidAmount,
        journalEntryId: payJeId,
        userId
      });
    }
    await auditLog(conn, {
      userId,
      action: "other",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: orderId,
      referenceNumber: orderNo,
      description: `Backdated order entry ${orderNo} \u2014 \u09F3${totalAmount.toLocaleString()} dated ${transaction_date}, admin bypass of the full pipeline${paidAmount > 0 ? ` \xB7 \u09F3${paidAmount.toLocaleString()} paid` : ""}`,
      severity: "critical",
      ipAddress
    });
    await conn.commit();
    sendTelegram(
      `\u{1F570}\uFE0F <b>Backdated Order Entry</b>
${orderNo} \u2014 ${customer.name}
\u09F3${totalAmount.toLocaleString()} dated ${transaction_date} \xB7 by ${userName}` + (paidAmount > 0 ? `
\u{1F4B0} \u09F3${paidAmount.toLocaleString()} already collected` : "") + (goResult.alreadyPosted ? "" : "\n\u{1F4D2} Invoice posted to ledger + journal entry")
    );
    return {
      ok: true,
      id: orderId,
      order_number: orderNo,
      status: "delivered",
      total_amount: totalAmount,
      balance_due: balanceDue,
      ...paymentNo ? { payment_number: paymentNo } : {}
    };
  } catch (e) {
    await conn.rollback();
    if (e == null ? void 0 : e.statusCode) throw e;
    console.error("[backdated] entry failed:", e == null ? void 0 : e.message, "| errno:", e == null ? void 0 : e.errno);
    throw createError({ statusCode: 500, statusMessage: (_v = (_u = e == null ? void 0 : e.sqlMessage) != null ? _u : e == null ? void 0 : e.message) != null ? _v : "Backdated entry failed" });
  } finally {
    conn.release();
  }
});

export { backdated_post as default };
//# sourceMappingURL=backdated.post.mjs.map
