import { q as defineEventHandler, au as readBody, X as getUserSession, m as createError, P as POS_VALID_METHODS, z as getDb, I as getPosCustomerOutstanding, at as queuePendingRequest, aO as sendTelegram, ao as postPosSale, g as auditLog, B as getDeliveryQrSecret, ad as posExitQrSignature, M as getRequestURL, a1 as isAdminRole } from '../../../nitro/nitro.mjs';
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

const complete_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const isAdmin = isAdminRole(role);
  const {
    branch_id = 1,
    customer_id = null,
    items = [],
    discount = 0,
    payment_method = "Cash",
    cash_amount = null,
    credit_amount = 0,
    cash_account_id = null,
    bank_account_id = null,
    payment_reference = null
  } = body != null ? body : {};
  if (!(items == null ? void 0 : items.length)) throw createError({ statusCode: 400, statusMessage: "No items in cart" });
  if (!POS_VALID_METHODS.includes(payment_method))
    throw createError({ statusCode: 400, statusMessage: "Invalid payment method" });
  const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const creditAmt = Math.max(0, Math.min(Number(credit_amount) || 0, total));
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (creditAmt > 9e-3 && customer_id) {
      const [[customer]] = await conn.query(`SELECT id, name, credit_limit FROM customers WHERE id = ? FOR UPDATE`, [customer_id]);
      if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
      const existing = await getPosCustomerOutstanding(conn, customer_id);
      const limit = Number((_c = customer.credit_limit) != null ? _c : 0);
      if (existing + creditAmt > limit && !isAdmin) {
        const reqId = await queuePendingRequest(conn, {
          requestType: "pos_credit_sale",
          payload: body,
          customerId: customer_id,
          amount: total,
          referenceLabel: `POS credit sale for ${customer.name} \u2014 \u09F3${creditAmt.toLocaleString()} would push balance to \u09F3${(existing + creditAmt).toLocaleString()} against a \u09F3${limit.toLocaleString()} limit`,
          requestedBy: userId,
          requestedReason: `Exceeds POS credit limit (\u09F3${limit.toLocaleString()})`
        });
        await conn.commit();
        sendTelegram(
          `\u23F3 <b>POS Credit Sale Queued</b>
${customer.name} \u2014 \u09F3${creditAmt.toLocaleString()} on credit
Would push balance to \u09F3${(existing + creditAmt).toLocaleString()} vs \u09F3${limit.toLocaleString()} limit
Requested by ${userName} \u2014 admin approval required`,
          "orders"
        );
        return {
          ok: true,
          queued: true,
          pending_request_id: reqId,
          message: `This sale exceeds the customer's credit limit and has been sent to an admin for approval. Do not release the goods yet.`
        };
      }
    }
    const result = await postPosSale(conn, {
      branchId: branch_id,
      customerId: customer_id,
      items,
      discount: Number(discount || 0),
      paymentMethod: payment_method,
      cashAmount: cash_amount,
      creditAmount: creditAmt,
      cashAccountId: cash_account_id,
      bankAccountId: bank_account_id,
      paymentReference: payment_reference,
      userId,
      isAdmin
    });
    await auditLog(conn, {
      userId,
      action: "created",
      module: "other",
      recordType: "pos_order",
      recordId: result.orderId,
      referenceNumber: result.orderNumber,
      description: `POS sale ${result.orderNumber} \u2014 \u09F3${total.toLocaleString()} (cash \u09F3${result.cashAmount.toLocaleString()} / credit \u09F3${result.creditAmount.toLocaleString()})`,
      severity: "info"
    });
    await conn.commit();
    const secret = await getDeliveryQrSecret(conn);
    const sig = posExitQrSignature(result.orderNumber, secret);
    const origin = getRequestURL(event).origin;
    const verifyUrl = `${origin}/pos/exit/${result.orderId}?sig=${sig}`;
    return {
      ok: true,
      order_number: result.orderNumber,
      order_id: result.orderId,
      total: result.total,
      cash_amount: result.cashAmount,
      credit_amount: result.creditAmount,
      exit_status: result.exitStatus,
      verify_url: verifyUrl
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
