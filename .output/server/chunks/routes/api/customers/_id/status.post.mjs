import { u as defineEventHandler, a0 as getRouterParam, aS as requireAction, aF as readBody, r as createError, I as getDb, k as auditLog, A as ACCOUNTS_ROLES } from '../../../../nitro/nitro.mjs';
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

const status_post = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const { userId } = await requireAction(
    event,
    { module: "customers", page: "list", action: "blacklist", roleFallback: ACCOUNTS_ROLES },
    "Only Accounts / admin (or a user granted Customers \u2192 Blacklist) may change a customer's status"
  );
  const body = await readBody(event);
  const status = String((_a = body == null ? void 0 : body.status) != null ? _a : "");
  const reason = String((_b = body == null ? void 0 : body.reason) != null ? _b : "").trim().slice(0, 500);
  if (!["active", "inactive", "blacklisted"].includes(status)) throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  if (reason.length < 3) throw createError({ statusCode: 400, statusMessage: "A reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[c]] = await conn.query(`SELECT id, name, status FROM customers WHERE id = ? FOR UPDATE`, [id]);
    if (!c) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
    if (c.status === status) throw createError({ statusCode: 409, statusMessage: `Customer is already ${status}` });
    await conn.query(`UPDATE customers SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    await conn.query(
      `INSERT INTO customer_notes (customer_id, note, kind, created_by_user_id) VALUES (?, ?, 'status', ?)`,
      [id, `${c.status} \u2192 ${status}: ${reason}`, userId]
    );
    await auditLog(conn, {
      userId,
      action: "status_changed",
      module: "customers",
      recordType: "customer",
      recordId: id,
      referenceNumber: c.name,
      description: `Customer ${c.name}: ${c.status} \u2192 ${status} \u2014 ${reason}`,
      severity: status === "blacklisted" ? "warning" : "info"
    });
    await conn.commit();
    return { ok: true, status };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { status_post as default };
//# sourceMappingURL=status.post.mjs.map
