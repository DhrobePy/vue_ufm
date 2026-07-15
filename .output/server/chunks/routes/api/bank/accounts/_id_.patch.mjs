import { o as defineEventHandler, L as getRouterParam, ac as readBody, O as getUserSession, k as createError, w as getDb, e as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const role = ((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.role) != null ? _d : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[old]] = await conn.query(`SELECT * FROM bank_tx_accounts WHERE id = ?`, [id]);
    if (!old) throw createError({ statusCode: 404, statusMessage: "Account not found" });
    const sets = [];
    const vals = [];
    const fields = ["bank_name", "account_name", "branch_name", "account_number", "account_type", "opening_balance", "status"];
    for (const f of fields) {
      if (body[f] !== void 0) {
        sets.push(`${f} = ?`);
        vals.push(body[f]);
      }
    }
    if (!sets.length) {
      await conn.rollback();
      return { message: "Nothing to update" };
    }
    sets.push("updated_at = NOW()");
    await conn.query(`UPDATE bank_tx_accounts SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    await auditLog(conn, { userId, action: "user_updated", module: "bank", recordType: "bank_account", recordId: id, description: `Bank account "${old.bank_name}" updated` });
    await conn.commit();
    return { message: "Account updated successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
