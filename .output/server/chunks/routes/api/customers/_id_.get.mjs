import { m as defineEventHandler, H as getRouterParam, i as createError, a3 as queryOne, a2 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [customer, recentOrders, recentPayments] = await Promise.all([
    queryOne(
      `SELECT c.*
       FROM customers c
       WHERE c.id = ?`,
      [id]
    ),
    query(
      `SELECT o.id, o.order_number, o.order_date, o.status, o.total_amount, o.balance_due
       FROM credit_orders o
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC
       LIMIT 10`,
      [id]
    ),
    query(
      `SELECT p.id, p.payment_date, p.amount, p.payment_method, p.reference_number,
              p.allocation_status, p.notes
       FROM customer_payments p
       WHERE p.customer_id = ?
       ORDER BY p.payment_date DESC
       LIMIT 10`,
      [id]
    )
  ]);
  if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
  return { customer, recentOrders, recentPayments };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
