import { o as defineEventHandler, O as getUserSession, k as createError, aA as userCanAction, A as ACCOUNTS_ROLES, S as SALES_ROLES, ae as readBody, w as getDb } from '../../nitro/nitro.mjs';
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
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user))
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const canCreate = await userCanAction({
    userId,
    role,
    module: "customers",
    page: "list",
    action: "create",
    roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES, "collector"]
  });
  if (!canCreate)
    throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to create customers" });
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
