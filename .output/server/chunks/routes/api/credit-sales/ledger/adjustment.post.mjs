import { q as defineEventHandler, X as getUserSession, m as createError, b as ADMIN_ROLES, as as readBody, z as getDb, ai as postCustomerLedger, g as auditLog, aK as sendTelegram } from '../../../../nitro/nitro.mjs';
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

const adjustment_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const customerId = Number(body == null ? void 0 : body.customer_id);
  const direction = (body == null ? void 0 : body.direction) === "credit" ? "credit" : (body == null ? void 0 : body.direction) === "debit" ? "debit" : null;
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  const reason = String((_d = body == null ? void 0 : body.reason) != null ? _d : "").trim();
  if (!customerId) throw createError({ statusCode: 400, statusMessage: "customer_id required" });
  if (!direction) throw createError({ statusCode: 400, statusMessage: 'direction must be "debit" or "credit"' });
  if (!amount || amount <= 0) throw createError({ statusCode: 400, statusMessage: "amount must be greater than zero" });
  if (!reason) throw createError({ statusCode: 400, statusMessage: "reason is required for a manual adjustment" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[customer]] = await conn.query(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`,
      [customerId]
    );
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const ledgerId = await postCustomerLedger(conn, {
      customerId,
      date,
      transactionType: "adjustment",
      referenceType: "manual_adjustment",
      referenceId: 0,
      invoiceNumber: `ADJ-${Date.now()}`,
      description: `Manual ${direction} adjustment \u2014 ${reason}`,
      debit: direction === "debit" ? amount : 0,
      credit: direction === "credit" ? amount : 0,
      journalEntryId: null,
      // memo-level — no GL posting, per spec §2.10
      userId
    });
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "customer_ledger",
      recordId: ledgerId,
      description: `Manual ${direction} adjustment for ${customer.name} \u2014 \u09F3${amount.toLocaleString()} \u2014 ${reason}`,
      severity: "critical"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4DD} <b>Manual Ledger Adjustment</b>
${customer.name}
${direction === "debit" ? "+" : "\u2212"}\u09F3${amount.toLocaleString()} (${direction})
Reason: ${reason}
by ${userName}`
    );
    return { ok: true, id: ledgerId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { adjustment_post as default };
//# sourceMappingURL=adjustment.post.mjs.map
