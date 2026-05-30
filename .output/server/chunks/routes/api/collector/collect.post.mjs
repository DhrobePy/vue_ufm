import { g as defineEventHandler, G as readBody, d as createError, E as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const collect_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { customer_id, amount, method, notes } = body;
  if (!customer_id || !amount || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: "customer_id and positive amount are required" });
  const result = await query(
    `INSERT INTO customer_payments
       (customer_id, payment_date, amount, payment_method, notes, allocation_status, created_by_user_id)
     VALUES (?, CURDATE(), ?, ?, ?, 'unallocated', 1)`,
    [customer_id, Number(amount), method != null ? method : "cash", notes != null ? notes : null]
  );
  return { id: result.insertId, message: "Collection recorded" };
});

export { collect_post as default };
//# sourceMappingURL=collect.post.mjs.map
