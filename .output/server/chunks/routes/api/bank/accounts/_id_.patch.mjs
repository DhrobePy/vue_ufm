import { q as defineEventHandler, R as getRouterParam, au as readBody, X as getUserSession, m as createError, z as getDb, g as auditLog } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
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
    const [[old]] = await conn.query(`SELECT * FROM bank_accounts WHERE id = ?`, [id]);
    if (!old) throw createError({ statusCode: 404, statusMessage: "Account not found" });
    const sets = [];
    const vals = [];
    const fields = ["bank_name", "account_name", "branch_name", "account_number", "account_type", "status"];
    for (const f of fields) {
      if (body[f] !== void 0) {
        sets.push(`${f} = ?`);
        vals.push(body[f]);
      }
    }
    if (body.opening_balance !== void 0) {
      sets.push("initial_balance = ?");
      vals.push(Number(body.opening_balance));
    }
    if (!sets.length) {
      await conn.rollback();
      return { message: "Nothing to update" };
    }
    sets.push("updated_at = NOW()");
    await conn.query(`UPDATE bank_accounts SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    if (old.legacy_tx_account_id) {
      const mirrorSets = [];
      const mirrorVals = [];
      if (body.bank_name !== void 0) {
        mirrorSets.push("bank_name = ?");
        mirrorVals.push(body.bank_name);
      }
      if (body.account_name !== void 0) {
        mirrorSets.push("account_name = ?");
        mirrorVals.push(body.account_name);
      }
      if (body.branch_name !== void 0) {
        mirrorSets.push("branch_name = ?");
        mirrorVals.push(body.branch_name);
      }
      if (body.account_number !== void 0) {
        mirrorSets.push("account_number = ?");
        mirrorVals.push(body.account_number);
      }
      if (body.opening_balance !== void 0) {
        mirrorSets.push("opening_balance = ?");
        mirrorVals.push(Number(body.opening_balance));
      }
      if (body.status !== void 0) {
        mirrorSets.push("status = ?");
        mirrorVals.push(body.status === "closed" ? "inactive" : body.status);
      }
      if (mirrorSets.length) {
        mirrorSets.push("updated_at = NOW()");
        await conn.query(`UPDATE bank_tx_accounts SET ${mirrorSets.join(", ")} WHERE id = ?`, [...mirrorVals, old.legacy_tx_account_id]);
      }
    }
    if ((body.bank_name !== void 0 || body.account_name !== void 0) && old.chart_of_account_id) {
      const newBankName = (_e = body.bank_name) != null ? _e : old.bank_name;
      const newAccountName = (_f = body.account_name) != null ? _f : old.account_name;
      await conn.query(
        `UPDATE chart_of_accounts SET name = ? WHERE id = ?`,
        [`${newBankName} \u2014 ${newAccountName}`.slice(0, 255), old.chart_of_account_id]
      );
    }
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
