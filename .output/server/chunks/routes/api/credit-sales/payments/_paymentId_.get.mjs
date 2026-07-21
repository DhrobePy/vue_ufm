import { o as defineEventHandler, M as getRouterParam, k as createError, Q as getUserSession, ad as queryOne, ac as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _paymentId__get = defineEventHandler(async (event) => {
  var _a;
  const paymentId = Number(getRouterParam(event, "paymentId"));
  if (!paymentId) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const payment = await queryOne(
    `SELECT p.*, c.name AS customer_name, c.phone_number AS customer_phone,
            c.business_address AS customer_address,
            o.order_number AS direct_order_number,
            u.display_name AS recorded_by,
            ba.account_name AS bank_account_name, ba.bank_name,
            pca.account_name AS cash_account_name
     FROM customer_payments p
     JOIN customers c ON c.id = p.customer_id
     LEFT JOIN credit_orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = p.created_by_user_id
     LEFT JOIN bank_accounts ba ON ba.id = p.bank_account_id
     LEFT JOIN branch_petty_cash_accounts pca ON pca.id = p.cash_account_id
     WHERE p.id = ?`,
    [paymentId]
  );
  if (!payment) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
  const allocations = await query(
    `SELECT pa.allocated_amount, pa.as_advance, o.order_number, o.status, o.balance_due
     FROM payment_allocations pa
     JOIN credit_orders o ON o.id = pa.order_id
     WHERE pa.payment_id = ?`,
    [paymentId]
  );
  const ledger = await queryOne(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS outstanding
     FROM customer_ledger WHERE customer_id = ?`,
    [payment.customer_id]
  );
  return { payment, allocations, outstanding: Number((_a = ledger == null ? void 0 : ledger.outstanding) != null ? _a : 0) };
});

export { _paymentId__get as default };
//# sourceMappingURL=_paymentId_.get.mjs.map
