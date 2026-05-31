import { h as defineEventHandler, I as readBody, e as createError, n as getDb } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, business_name, phone_number, email, business_address, customer_type, credit_limit } = body;
  if (!name || !name.trim()) {
    throw createError({ statusCode: 422, statusMessage: "Customer name is required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO customers
         (name, business_name, phone_number, email, business_address,
          customer_type, credit_limit, current_balance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
      [
        name.trim(),
        business_name || null,
        phone_number || null,
        email || null,
        business_address || null,
        customer_type || "Credit",
        credit_limit || 0
      ]
    );
    return { id: result.insertId, message: "Customer created successfully" };
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
