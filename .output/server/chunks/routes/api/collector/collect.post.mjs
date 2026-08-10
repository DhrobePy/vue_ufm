import { q as defineEventHandler, as as readBody, m as createError, z as getDb, a6 as nextDocNumber, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const collect_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { customer_id, amount, method, notes } = body;
  if (!customer_id || !amount || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: "customer_id and positive amount are required" });
  const methodMap = {
    cash: "Cash",
    bkash: "Mobile Banking",
    nagad: "Mobile Banking",
    bank: "Bank Transfer",
    Cash: "Cash"
  };
  const mappedMethod = (_a = methodMap[method != null ? method : ""]) != null ? _a : "Cash";
  const conn = await getDb().getConnection();
  let payNo;
  try {
    payNo = await nextDocNumber(conn, "PAY", "customer_payments", "payment_number");
  } finally {
    conn.release();
  }
  const result = await query(
    `INSERT INTO customer_payments
       (payment_number, customer_id, payment_date, amount, payment_method,
        payment_type, allocation_status, allocated_amount, notes, created_by_user_id)
     VALUES (?, ?, CURDATE(), ?, ?, 'advance', 'unallocated', 0, ?, 1)`,
    [payNo, customer_id, Number(amount), mappedMethod, notes != null ? notes : null]
  );
  return { id: result.insertId, payment_number: payNo, message: "Collection recorded" };
});

export { collect_post as default };
//# sourceMappingURL=collect.post.mjs.map
