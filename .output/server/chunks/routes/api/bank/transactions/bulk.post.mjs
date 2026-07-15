import { n as defineEventHandler, ab as readBody, j as createError, N as getUserSession, F as getRequestIP, v as getDb } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const bulk_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const body = await readBody(event);
  const { ids, action, reason } = body;
  if (!(ids == null ? void 0 : ids.length) || !["unpost", "delete"].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: "ids (array) and action (unpost|delete) required" });
  }
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  const userId = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1;
  const userName = (_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.name) != null ? _f : "System";
  const ip = (_g = getRequestIP(event)) != null ? _g : null;
  const isAdmin = ["admin", "superadmin"].includes(role);
  if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin can perform bulk actions" });
  if (action === "delete" && role !== "superadmin") {
    throw createError({ statusCode: 403, statusMessage: "Only Superadmin can bulk delete transactions" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let affected = 0;
    for (const id of ids) {
      const [[txn]] = await conn.query(`SELECT * FROM bank_transactions WHERE id = ?`, [id]);
      if (!txn) continue;
      if (action === "delete") {
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, notes)
           VALUES (?, 'deleted', ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip, JSON.stringify(txn), reason ? `BULK DELETE: ${reason}` : "BULK DELETE by Superadmin"]
        );
        await conn.query(`DELETE FROM bank_transactions WHERE id = ?`, [id]);
      } else {
        await conn.query(
          `UPDATE bank_transactions SET status = 'unposted', updated_at = NOW() WHERE id = ?`,
          [id]
        );
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
           VALUES (?, 'unposted', ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            userName,
            ip,
            JSON.stringify({ status: txn.status }),
            JSON.stringify({ status: "unposted" }),
            reason ? `BULK UNPOST: ${reason}` : "Bulk unpost by admin"
          ]
        );
      }
      affected++;
    }
    await conn.commit();
    return { affected, message: `${affected} transaction(s) ${action}ed successfully` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { bulk_post as default };
//# sourceMappingURL=bulk.post.mjs.map
