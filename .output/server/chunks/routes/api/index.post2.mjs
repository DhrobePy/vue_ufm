import { u as defineEventHandler, a5 as getUserSession, r as createError, bb as userCanAction, A as ACCOUNTS_ROLES, S as SALES_ROLES, aF as readBody, I as getDb, ar as postCustomerLedger, k as auditLog } from '../../nitro/nitro.mjs';
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
  const { name, business_name, phone_number, email, business_address, customer_type, credit_limit, opening_balance } = body;
  if (!name || !name.trim()) {
    throw createError({ statusCode: 422, statusMessage: "Customer name is required" });
  }
  const openingBal = Math.max(0, Number(opening_balance) || 0);
  if (openingBal > 9e-3 && !await userCanAction({
    userId,
    role,
    module: "customers",
    page: "list",
    action: "set_opening_balance",
    roleFallback: [],
    explicit: true
  }))
    throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin, or a user granted "Set Opening Balance", may set an opening balance' });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [dups] = await conn.query(
      `SELECT id, name FROM customers WHERE (? <> '' AND phone_number = ?) OR (? <> '' AND email = ?) LIMIT 1`,
      [phone_number || "", phone_number || "", email || "", email || ""]
    );
    if (dups.length)
      throw createError({ statusCode: 409, statusMessage: `A customer with this phone number or email already exists (${dups[0].name})` });
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
    const customerId = result.insertId;
    if (openingBal > 9e-3) {
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const ledgerId = await postCustomerLedger(conn, {
        customerId,
        date,
        transactionType: "opening_balance",
        referenceType: "opening_balance",
        referenceId: 0,
        invoiceNumber: `OB-${customerId}`,
        description: `Opening balance \u2014 existing outstanding due carried into the system at customer creation`,
        debit: openingBal,
        credit: 0,
        journalEntryId: null,
        // memo-level, matches the manual-adjustment convention — no GL posting
        userId
      });
      await auditLog(conn, {
        userId,
        action: "created",
        module: "customers",
        recordType: "customer_ledger",
        recordId: ledgerId,
        description: `Opening balance \u09F3${openingBal.toLocaleString()} recorded for new customer "${name.trim()}"`,
        severity: "info"
      });
    }
    await conn.commit();
    return { id: customerId, message: "Customer created successfully" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
