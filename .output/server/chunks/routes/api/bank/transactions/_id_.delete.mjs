import { m as defineEventHandler, H as getRouterParam, K as getUserSession, B as getRequestIP, i as createError, u as getDb } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1;
  const userName = (_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.name) != null ? _f : "System";
  const ip = (_g = getRequestIP(event)) != null ? _g : null;
  if (!["superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only Superadmin can permanently delete transactions" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[txn]] = await conn.query(`SELECT * FROM bank_transactions WHERE id = ?`, [id]);
    if (!txn) throw createError({ statusCode: 404, statusMessage: "Transaction not found" });
    await conn.query(
      `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, notes)
       VALUES (?, 'deleted', ?, ?, ?, ?, 'PERMANENTLY DELETED by Superadmin')`,
      [id, userId, userName, ip, JSON.stringify(txn)]
    );
    await conn.query(`DELETE FROM bank_transactions WHERE id = ?`, [id]);
    await conn.commit();
    return { message: `Transaction ${txn.transaction_number} permanently deleted` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
