import { n as defineEventHandler, aa as readBody, N as getUserSession, E as getRequestHeader, j as createError, v as getDb, u as getCustomerOutstanding, e as auditLog, ai as sendTelegram } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const ipAddress = (_f = (_e = getRequestHeader(event, "x-forwarded-for")) != null ? _e : getRequestHeader(event, "x-real-ip")) != null ? _f : void 0;
  const {
    customer_id,
    branch_id,
    // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address,
    // maps to shipping_address in DB
    special_notes,
    // maps to special_instructions in DB
    amount_paid,
    // advance payment amount
    // ── advance payment details ───────────────────────────────────────────
    advance_payment_method,
    // 'Cash'|'Bank Transfer'|'Cheque'|'Mobile Banking'|'Card'
    advance_bank_account_id,
    // when method = Bank Transfer | Cheque
    advance_cash_account_id,
    // when method = Cash
    advance_reference,
    // transaction/mobile ref
    advance_cheque_number,
    // when method = Cheque
    advance_cheque_date,
    // when method = Cheque
    advance_bank_tx_type,
    // RTGS|BEFTN|NPSB|Online|Deposit
    advance_collected_by_employee_id,
    delivery_type,
    // 'big_truck' (default) | 'mini_truck'
    items
    // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
  } = body != null ? body : {};
  if (!customer_id || !(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "customer_id and items are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_g = cnt.n) != null ? _g : 0) + 1).padStart(4, "0");
    const orderNo = `CR-${today}-${seq}`;
    let subtotal = 0;
    for (const it of items) {
      const qty = Number((_i = (_h = it.qty_bags) != null ? _h : it.quantity) != null ? _i : 0);
      const line = qty * Number(it.unit_price) - Number((_j = it.discount_amount) != null ? _j : 0);
      subtotal += line;
    }
    const deliveryType = delivery_type === "mini_truck" ? "mini_truck" : "big_truck";
    let miniTruckSurcharge = 0;
    if (deliveryType === "mini_truck" && branch_id) {
      const [mtComponents] = await conn.query(
        `SELECT weight_class, SUM(amount) AS amt
         FROM branch_price_components
         WHERE branch_id = ? AND charge_type = 'mini_truck' AND is_active = 1
         GROUP BY weight_class`,
        [Number(branch_id)]
      );
      const perWc = {};
      for (const c of mtComponents) perWc[c.weight_class] = Number(c.amt);
      for (const it of items) {
        const qty = Number((_l = (_k = it.qty_bags) != null ? _k : it.quantity) != null ? _l : 0);
        let wc = "all";
        if (it.variant_id) {
          const [[pv]] = await conn.query(
            `SELECT weight_variant FROM product_variants WHERE id = ?`,
            [it.variant_id]
          );
          const wv = String((_m = pv == null ? void 0 : pv.weight_variant) != null ? _m : "");
          wc = wv.includes("50") ? "50" : wv.includes("74") ? "74" : "all";
        }
        const perBag = ((_n = perWc[wc]) != null ? _n : 0) + (wc !== "all" ? (_o = perWc["all"]) != null ? _o : 0 : 0);
        miniTruckSurcharge += qty * perBag;
      }
      miniTruckSurcharge = Math.round(miniTruckSurcharge * 100) / 100;
    }
    const totalAmount = subtotal + miniTruckSurcharge;
    const advancePaid = Number(amount_paid != null ? amount_paid : 0);
    const balanceDue = Math.max(0, totalAmount - advancePaid);
    const [[customer]] = await conn.query(
      `SELECT credit_limit, name AS customer_name FROM customers WHERE id = ?`,
      [customer_id]
    );
    const creditLimit = Number((_p = customer == null ? void 0 : customer.credit_limit) != null ? _p : 0);
    const exposure = await getCustomerOutstanding(conn, Number(customer_id));
    const totalExposure = exposure.totalExposure + balanceDue;
    const overLimit = creditLimit > 0 && totalExposure > creditLimit;
    const excessAmount = overLimit ? Math.round(totalExposure - creditLimit) : 0;
    let orderStatus;
    let wfAction;
    let wfComment;
    if (overLimit) {
      orderStatus = "escalated";
      wfAction = "escalated";
      wfComment = `Order created \u2014 ESCALATED \xB7 \u09F3${totalAmount.toLocaleString()} \xB7 credit limit \u09F3${creditLimit.toLocaleString()} exceeded by \u09F3${excessAmount.toLocaleString()}`;
    } else if (isAdmin) {
      orderStatus = "approved";
      wfAction = "approved";
      wfComment = `Order created and auto-approved \u2014 \u09F3${totalAmount.toLocaleString()} (${role})`;
    } else {
      orderStatus = "pending_approval";
      wfAction = "submit";
      wfComment = `Order created and submitted for approval \u2014 \u09F3${totalAmount.toLocaleString()}`;
    }
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id]
        );
        it.product_id = (_q = pv == null ? void 0 : pv.product_id) != null ? _q : null;
      }
    }
    const dispatchPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const deliveryPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const [result] = await conn.query(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          delivery_type, mini_truck_surcharge,
          dispatch_pin, delivery_pin,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id != null ? branch_id : null,
        order_date,
        required_date || null,
        priority != null ? priority : "normal",
        orderStatus,
        delivery_address || null,
        special_notes || null,
        subtotal,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
        deliveryType,
        miniTruckSurcharge,
        dispatchPin,
        deliveryPin,
        userId
      ]
    );
    const orderId = result.insertId;
    for (const it of items) {
      const qty = Number((_s = (_r = it.qty_bags) != null ? _r : it.quantity) != null ? _s : 0);
      const lineTotal = qty * Number(it.unit_price) - Number((_t = it.discount_amount) != null ? _t : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,
          // NOT NULL in DB — looked up above if missing
          (_u = it.variant_id) != null ? _u : null,
          qty,
          Number(it.unit_price),
          Number((_v = it.discount_amount) != null ? _v : 0),
          lineTotal
        ]
      );
    }
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', ?, ?, ?, ?, NOW())`,
      [orderId, orderStatus, wfAction, userId, wfComment]
    );
    if (advancePaid > 0) {
      const validMethods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking", "Card"];
      const payMethod = validMethods.includes(advance_payment_method) ? advance_payment_method : "Cash";
      const advDay = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      const [[acnt]] = await conn.query(
        `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`
      );
      const advSeq = String(((_w = acnt.n) != null ? _w : 0) + 1).padStart(4, "0");
      const advNo = `PAY-${advDay}-${advSeq}`;
      const [advResult] = await conn.query(
        `INSERT INTO customer_payments
           (order_id, payment_number, customer_id, payment_date, amount,
            payment_method, payment_type,
            bank_account_id, cash_account_id,
            cheque_number, cheque_date, bank_transaction_type,
            reference_number, allocation_status, allocated_amount,
            notes, collected_by_employee_id, branch_id, created_by_user_id)
         VALUES (?, ?, ?, ?, ?,
                 ?, 'advance',
                 ?, ?,
                 ?, ?, ?,
                 ?, 'allocated', ?,
                 ?, ?, ?, ?)`,
        [
          orderId,
          advNo,
          customer_id,
          order_date,
          advancePaid,
          payMethod,
          advance_bank_account_id ? Number(advance_bank_account_id) : null,
          advance_cash_account_id ? Number(advance_cash_account_id) : null,
          advance_cheque_number || null,
          advance_cheque_date || null,
          advance_bank_tx_type || null,
          advance_reference || advNo,
          advancePaid,
          `Advance payment at order creation (${payMethod})`,
          advance_collected_by_employee_id ? Number(advance_collected_by_employee_id) : null,
          branch_id ? Number(branch_id) : null,
          userId
        ]
      );
      const advPaymentId = advResult.insertId;
      const [[lastLedger]] = await conn.query(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [customer_id]
      );
      const prevBal = Number((_x = lastLedger == null ? void 0 : lastLedger.bal) != null ? _x : 0);
      const newBal = Math.max(0, prevBal - advancePaid);
      let advJeId = null;
      try {
        let drAccountId = null;
        if (payMethod === "Cash" && advance_cash_account_id) {
          const [[ca]] = await conn.query(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(advance_cash_account_id)]
          );
          drAccountId = (_y = ca == null ? void 0 : ca.chart_of_account_id) != null ? _y : null;
        } else if (["Bank Transfer", "Cheque", "Card"].includes(payMethod) && advance_bank_account_id) {
          const [[ba]] = await conn.query(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [Number(advance_bank_account_id)]
          );
          drAccountId = (_z = ba == null ? void 0 : ba.chart_of_account_id) != null ? _z : null;
        }
        let crAccountId = null;
        const [[ar]] = await conn.query(
          `SELECT id FROM chart_of_accounts
           WHERE account_type = 'Accounts Receivable'
           ORDER BY id ASC LIMIT 1`
        );
        crAccountId = (_A = ar == null ? void 0 : ar.id) != null ? _A : null;
        if (drAccountId && crAccountId) {
          const jeDesc = `Advance received \u2014 ${advNo} (Order ${orderNo}, ${customer_id})`;
          const [jeRes] = await conn.query(
            `INSERT INTO journal_entries
               (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
             VALUES (?, ?, 'CustomerPayment', ?, ?)`,
            [order_date, jeDesc.slice(0, 255), advPaymentId, userId]
          );
          advJeId = jeRes.insertId;
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, 0.00, ?)`,
            [advJeId, drAccountId, advancePaid, advNo]
          );
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, 0.00, ?, ?)`,
            [advJeId, crAccountId, advancePaid, advNo]
          );
          await conn.query(
            `UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`,
            [advJeId, advPaymentId]
          );
          if (payMethod === "Cash" && advance_cash_account_id) {
            const [[pcAcc]] = await conn.query(
              `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
              [Number(advance_cash_account_id)]
            );
            const pcBal = Number((_B = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _B : 0);
            await conn.query(
              `INSERT INTO branch_petty_cash_transactions
                 (account_id, branch_id, transaction_type, amount, balance_after,
                  reference_type, reference_id, description, created_by_user_id, transaction_date)
               VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
              [
                Number(advance_cash_account_id),
                (_C = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _C : null,
                advancePaid,
                pcBal + advancePaid,
                advPaymentId,
                `Advance from order ${orderNo}`,
                userId,
                order_date
              ]
            );
            await conn.query(
              `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
              [advancePaid, Number(advance_cash_account_id)]
            );
          }
        } else {
          console.warn(`[advance-payment] Skipping JE for ${advNo}: drAccountId=${drAccountId}, crAccountId=${crAccountId}`);
        }
      } catch (jeErr) {
        console.warn(`[advance-payment] JE creation failed for ${advNo}:`, jeErr);
      }
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after,
            journal_entry_id, created_by_user_id)
         VALUES (?, ?, 'advance_payment', 'customer_payment', ?,
                 ?, ?, 0, ?, ?,
                 ?, ?)`,
        [
          customer_id,
          order_date,
          advPaymentId,
          advNo,
          `Advance payment \u2014 ${advNo} (Order ${orderNo}) via ${payMethod}`,
          advancePaid,
          newBal,
          advJeId,
          userId
        ]
      );
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW()
         WHERE id = ?`,
        [advancePaid, customer_id]
      );
    }
    await auditLog(conn, {
      userId,
      action: overLimit ? "other" : isAdmin ? "approved" : "other",
      module: "credit_sales",
      recordType: "credit_order",
      recordId: orderId,
      referenceNumber: orderNo,
      description: overLimit ? `Order ${orderNo} created \u2014 ESCALATED, credit limit exceeded by \u09F3${excessAmount.toLocaleString()} (total exposure \u09F3${totalExposure.toLocaleString()} vs limit \u09F3${creditLimit.toLocaleString()})` : isAdmin ? `Order ${orderNo} created and auto-approved \u2014 \u09F3${totalAmount.toLocaleString()} (${role})` : `Order ${orderNo} created, pending approval \u2014 \u09F3${totalAmount.toLocaleString()}`,
      severity: overLimit ? "warning" : "info",
      ipAddress
    });
    await conn.commit();
    sendTelegram(
      `${overLimit ? "\u26A0\uFE0F" : "\u{1F9FE}"} <b>New Credit Order${overLimit ? " \u2014 ESCALATED" : ""}</b>
${orderNo} \u2014 ${(_D = customer == null ? void 0 : customer.customer_name) != null ? _D : `Customer ${customer_id}`}
\u09F3${totalAmount.toLocaleString()} \xB7 ${items.length} item(s)` + (deliveryType === "mini_truck" ? ` \xB7 Mini truck (+\u09F3${miniTruckSurcharge.toLocaleString()})` : "") + (advancePaid > 0 ? `
Advance \u09F3${advancePaid.toLocaleString()} received` : "") + (overLimit ? `
Credit limit exceeded by \u09F3${excessAmount.toLocaleString()} \u2014 needs senior approval` : "")
    );
    return {
      ok: true,
      id: orderId,
      order_number: orderNo,
      status: orderStatus,
      over_limit: overLimit,
      mini_truck_surcharge: miniTruckSurcharge,
      ...overLimit ? { excess_amount: excessAmount } : {}
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
