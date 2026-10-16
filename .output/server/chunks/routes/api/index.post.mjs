import { u as defineEventHandler, aF as readBody, a5 as getUserSession, r as createError, V as getRequestHeader, bb as userCanAction, A as ACCOUNTS_ROLES, S as SALES_ROLES, aC as query, I as getDb, af as nextDocNumber, H as getCustomerOutstanding, av as postJournalEntry, ar as postCustomerLedger, C as getAdvanceCredit, b6 as suggestAllotment, g as applyAllotment, k as auditLog, b1 as sendTelegram } from '../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const ipAddress = (_c = (_b = getRequestHeader(event, "x-forwarded-for")) != null ? _b : getRequestHeader(event, "x-real-ip")) != null ? _c : void 0;
  const canCreate = await userCanAction({
    userId,
    role,
    module: "credit_sales",
    page: "all",
    action: "create",
    roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES]
  });
  if (!canCreate)
    throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to create orders" });
  const {
    customer_id,
    branch_id,
    // maps to assigned_branch_id in DB
    order_date: bodyOrderDate,
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
    is_other_sales,
    // true = Trading commodity sale via this flow (skips production)
    items
    // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
    // Other Sales items instead carry { commodity_id, commodity_origin, ... }
  } = body != null ? body : {};
  if (!customer_id || !(items == null ? void 0 : items.length)) {
    throw createError({ statusCode: 400, statusMessage: "customer_id and items are required" });
  }
  {
    const [cust] = await query("SELECT name, status, customer_type FROM customers WHERE id = ?", [Number(customer_id)]);
    if (!cust) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    if (cust.status !== "active")
      throw createError({ statusCode: 403, statusMessage: `${cust.name} is ${cust.status} \u2014 new orders are blocked (reactivate the customer on their profile first)` });
    if (cust.customer_type !== "Credit")
      throw createError({ statusCode: 400, statusMessage: `${cust.name} is a ${cust.customer_type} customer \u2014 credit orders are only for Credit customers` });
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let order_date = today;
  if (bodyOrderDate && /^\d{4}-\d{2}-\d{2}$/.test(String(bodyOrderDate).slice(0, 10)) && String(bodyOrderDate).slice(0, 10) !== today) {
    if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin / superadmin can back-date an order" });
    if (String(bodyOrderDate).slice(0, 10) > today) throw createError({ statusCode: 400, statusMessage: "Order date cannot be in the future" });
    order_date = String(bodyOrderDate).slice(0, 10);
  }
  if (is_other_sales) {
    if (!branch_id) throw createError({ statusCode: 400, statusMessage: "Please select the source Branch / Warehouse for this Other Sales order" });
    for (const it of items) {
      if (!it.commodity_id) throw createError({ statusCode: 400, statusMessage: "An Other Sales item is missing its commodity" });
      const [com] = await query("SELECT name, inventory_account_id FROM purchase_commodities WHERE id = ? AND is_sellable = 1", [Number(it.commodity_id)]);
      if (!com) throw createError({ statusCode: 400, statusMessage: "Commodity not found or not marked sellable" });
      if (!com.inventory_account_id)
        throw createError({ statusCode: 400, statusMessage: `"${com.name}" has no Inventory account configured \u2014 set one in Purchase \u2192 Commodities before selling it` });
    }
  } else {
    for (const it of items) {
      if (it.variant_id) continue;
      const [hv] = await query("SELECT COUNT(*) c FROM product_variants WHERE product_id = ?", [Number((_d = it.product_id) != null ? _d : 0)]);
      if (Number(hv == null ? void 0 : hv.c) > 0) {
        const [pn] = await query("SELECT base_name FROM products WHERE id = ?", [Number(it.product_id)]);
        throw createError({ statusCode: 400, statusMessage: `"${(_e = pn == null ? void 0 : pn.base_name) != null ? _e : "This product"}" needs a variant (grade / weight) \u2014 please pick one for that line` });
      }
    }
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const orderNo = await nextDocNumber(conn, "CR", "credit_orders", "order_number", order_date);
    let subtotal = 0;
    for (const it of items) {
      const qty = Number((_g = (_f = it.qty_bags) != null ? _f : it.quantity) != null ? _g : 0);
      const line = qty * Number(it.unit_price) - Number((_h = it.discount_amount) != null ? _h : 0);
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
        const qty = Number((_j = (_i = it.qty_bags) != null ? _i : it.quantity) != null ? _j : 0);
        let wc = "all";
        if (it.variant_id) {
          const [[pv]] = await conn.query(
            `SELECT weight_variant FROM product_variants WHERE id = ?`,
            [it.variant_id]
          );
          const wv = String((_k = pv == null ? void 0 : pv.weight_variant) != null ? _k : "");
          wc = wv.includes("50") ? "50" : wv.includes("74") ? "74" : "all";
        }
        const perBag = ((_l = perWc[wc]) != null ? _l : 0) + (wc !== "all" ? (_m = perWc["all"]) != null ? _m : 0 : 0);
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
    const creditLimit = Number((_n = customer == null ? void 0 : customer.credit_limit) != null ? _n : 0);
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
        it.product_id = (_o = pv == null ? void 0 : pv.product_id) != null ? _o : null;
      }
    }
    const dispatchPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const deliveryPin = Math.floor(1e5 + Math.random() * 9e5).toString();
    const [result] = await conn.query(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          delivery_type, mini_truck_surcharge, is_other_sales,
          dispatch_pin, delivery_pin,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?,
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
        0,
        // amount_paid: payments after dispatch. The advance lives ONLY in advance_paid (legacy rule) —
        advancePaid,
        // storing it in both made every `total − advance_paid − amount_paid` recompute subtract it twice
        balanceDue,
        deliveryType,
        miniTruckSurcharge,
        is_other_sales ? 1 : 0,
        dispatchPin,
        deliveryPin,
        userId
      ]
    );
    const orderId = result.insertId;
    for (const it of items) {
      const qty = Number((_q = (_p = it.qty_bags) != null ? _p : it.quantity) != null ? _q : 0);
      const lineTotal = qty * Number(it.unit_price) - Number((_r = it.discount_amount) != null ? _r : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, commodity_id, commodity_origin,
            quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          (_s = it.product_id) != null ? _s : null,
          // nullable since Other Sales (migration #59)
          (_t = it.variant_id) != null ? _t : null,
          it.commodity_id ? Number(it.commodity_id) : null,
          (_u = it.commodity_origin) != null ? _u : null,
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
      const advNo = await nextDocNumber(conn, "PAY", "customer_payments", "payment_number");
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
      let advJeId = null;
      try {
        let drAccountId = null;
        if (payMethod === "Cash" && advance_cash_account_id) {
          const [[ca]] = await conn.query(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(advance_cash_account_id)]
          );
          drAccountId = (_w = ca == null ? void 0 : ca.chart_of_account_id) != null ? _w : null;
        } else if (["Bank Transfer", "Cheque", "Card"].includes(payMethod) && advance_bank_account_id) {
          const [[ba]] = await conn.query(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [Number(advance_bank_account_id)]
          );
          drAccountId = (_x = ba == null ? void 0 : ba.chart_of_account_id) != null ? _x : null;
        }
        let crAccountId = null;
        const [[ar]] = await conn.query(
          `SELECT id FROM chart_of_accounts
           WHERE account_type = 'Accounts Receivable'
           ORDER BY id ASC LIMIT 1`
        );
        crAccountId = (_y = ar == null ? void 0 : ar.id) != null ? _y : null;
        if (drAccountId && crAccountId) {
          const jeDesc = `Advance received \u2014 ${advNo} (Order ${orderNo}, ${customer_id})`;
          advJeId = await postJournalEntry(conn, {
            date: order_date,
            description: jeDesc,
            docType: "CustomerPayment",
            docId: advPaymentId,
            userId,
            lines: [
              { accountId: drAccountId, debit: advancePaid, credit: 0, memo: advNo },
              { accountId: crAccountId, debit: 0, credit: advancePaid, memo: advNo }
            ]
          });
          await conn.query(
            `UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`,
            [advJeId, advPaymentId]
          );
          if (payMethod === "Cash" && advance_cash_account_id) {
            const [[pcAcc]] = await conn.query(
              `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
              [Number(advance_cash_account_id)]
            );
            const pcBal = Number((_z = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _z : 0);
            await conn.query(
              `INSERT INTO branch_petty_cash_transactions
                 (account_id, branch_id, transaction_type, amount, balance_after,
                  reference_type, reference_id, description, created_by_user_id, transaction_date)
               VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
              [
                Number(advance_cash_account_id),
                (_A = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _A : null,
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
      await postCustomerLedger(conn, {
        customerId: customer_id,
        date: order_date,
        transactionType: "advance_payment",
        referenceType: "customer_payment",
        referenceId: advPaymentId,
        invoiceNumber: advNo,
        description: `Advance payment \u2014 ${advNo} (Order ${orderNo}) via ${payMethod}`,
        debit: 0,
        credit: advancePaid,
        journalEntryId: advJeId,
        userId
      });
    }
    let advanceAllotted = 0;
    if ((body == null ? void 0 : body.use_advance_credit) !== false) {
      const credit = await getAdvanceCredit(conn, Number(customer_id));
      const plan = suggestAllotment(credit, "orders_first", { onlyNative: true }).filter((a) => a.target === "order");
      if (plan.length) advanceAllotted = (await applyAllotment(conn, Number(customer_id), userId, plan, `placed with ${orderNo}`)).total;
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
${orderNo} \u2014 ${(_B = customer == null ? void 0 : customer.customer_name) != null ? _B : `Customer ${customer_id}`}
\u09F3${totalAmount.toLocaleString()} \xB7 ${items.length} item(s)` + (deliveryType === "mini_truck" ? ` \xB7 Mini truck (+\u09F3${miniTruckSurcharge.toLocaleString()})` : "") + (advancePaid > 0 ? `
Advance \u09F3${advancePaid.toLocaleString()} received` : "") + (overLimit ? `
Credit limit exceeded by \u09F3${excessAmount.toLocaleString()} \u2014 needs senior approval` : ""),
      "orders"
    );
    return {
      ok: true,
      id: orderId,
      order_number: orderNo,
      status: orderStatus,
      over_limit: overLimit,
      mini_truck_surcharge: miniTruckSurcharge,
      advance_allotted: advanceAllotted,
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
