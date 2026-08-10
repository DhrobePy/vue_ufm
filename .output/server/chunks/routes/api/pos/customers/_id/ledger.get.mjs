import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, ap as query } from '../../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const ledger_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const customerId = Number(getRouterParam(event, "id"));
  if (!customerId) throw createError({ statusCode: 400, statusMessage: "Invalid customer" });
  const [customer, sales, ledger] = await Promise.all([
    query(`SELECT id, name, business_name, phone_number FROM customers WHERE id = ?`, [customerId]),
    query(
      `SELECT id, order_number, order_date, total_amount, cash_amount, credit_amount, payment_status
       FROM orders WHERE customer_id = ? AND order_type = 'POS' ORDER BY order_date DESC LIMIT 200`,
      [customerId]
    ),
    query(
      `SELECT l.*, u.display_name AS created_by_name FROM pos_customer_ledger l
       LEFT JOIN users u ON u.id = l.created_by_user_id
       WHERE l.customer_id = ? ORDER BY l.transaction_date DESC, l.id DESC LIMIT 200`,
      [customerId]
    )
  ]);
  if (!customer.length) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
  const [[balanceRow]] = await query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM pos_customer_ledger WHERE customer_id = ?`,
    [customerId]
  );
  const timeline = [
    ...sales.map((s) => ({
      kind: "sale",
      date: s.order_date,
      order_number: s.order_number,
      total_amount: Number(s.total_amount),
      cash_amount: Number(s.cash_amount),
      credit_amount: Number(s.credit_amount),
      payment_status: s.payment_status,
      balance_impact: Number(s.credit_amount) > 0
    })),
    ...ledger.filter((l) => l.transaction_type !== "sale").map((l) => ({
      kind: l.transaction_type,
      date: l.transaction_date,
      description: l.description,
      debit_amount: Number(l.debit_amount),
      credit_amount: Number(l.credit_amount),
      reference_number: l.reference_number,
      created_by_name: l.created_by_name
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { customer: customer[0], balance: Number((_a = balanceRow == null ? void 0 : balanceRow.bal) != null ? _a : 0), timeline };
});

export { ledger_get as default };
//# sourceMappingURL=ledger.get.mjs.map
