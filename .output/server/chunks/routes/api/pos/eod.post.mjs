import { q as defineEventHandler, X as getUserSession, m as createError, as as readBody, z as getDb, a1 as isAdminRole, g as auditLog, aK as sendTelegram } from '../../../nitro/nitro.mjs';
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

const eod_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  const body = await readBody(event);
  const cashAccountId = Number(body == null ? void 0 : body.cash_account_id);
  const actualCash = Number(body == null ? void 0 : body.actual_cash);
  const witnessUserId = (body == null ? void 0 : body.witness_user_id) ? Number(body.witness_user_id) : null;
  const varianceReason = String((_b = body == null ? void 0 : body.variance_reason) != null ? _b : "").trim();
  if (!cashAccountId || !(actualCash >= 0))
    throw createError({ statusCode: 400, statusMessage: "cash_account_id and a non-negative actual_cash are required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[acct]] = await conn.query(
      `SELECT * FROM branch_petty_cash_accounts WHERE id = ? FOR UPDATE`,
      [cashAccountId]
    );
    if (!acct) throw createError({ statusCode: 404, statusMessage: "Cash account not found" });
    const expectedCash = Number(acct.current_balance);
    const variance = Math.round((actualCash - expectedCash) * 100) / 100;
    if (Math.abs(variance) > 5e-3 && !varianceReason)
      throw createError({ statusCode: 400, statusMessage: "A variance reason is required when actual cash does not match expected" });
    const status = isAdminRole(role) || Math.abs(variance) < 5e-3 ? "approved" : "pending";
    const [res] = await conn.query(
      `INSERT INTO cash_verification_log
         (branch_id, verification_date, expected_cash, actual_cash, variance, variance_reason,
          verified_by_user_id, witness_user_id, notes, status, cash_account_id)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        acct.branch_id,
        expectedCash,
        actualCash,
        variance,
        varianceReason || null,
        userId,
        witnessUserId,
        (_c = body == null ? void 0 : body.notes) != null ? _c : null,
        status,
        cashAccountId
      ]
    );
    await auditLog(conn, {
      userId,
      action: "created",
      module: "other",
      recordType: "cash_verification",
      recordId: res.insertId,
      description: `EOD cash count \u2014 ${acct.account_name}: expected \u09F3${expectedCash.toLocaleString()}, actual \u09F3${actualCash.toLocaleString()}, variance \u09F3${variance.toLocaleString()}`,
      severity: Math.abs(variance) > 5e-3 ? "warning" : "info"
    });
    await conn.commit();
    if (Math.abs(variance) > 5e-3) {
      sendTelegram(
        `${variance < 0 ? "\u{1F534}" : "\u{1F7E1}"} <b>EOD Cash Variance</b>
${acct.account_name}
Expected \u09F3${expectedCash.toLocaleString()} \xB7 Actual \u09F3${actualCash.toLocaleString()} \xB7 Variance \u09F3${variance.toLocaleString()}
Reason: ${varianceReason}
By ${(_d = session.user.name) != null ? _d : userId}`,
        "orders"
      );
    }
    return { ok: true, id: res.insertId, expected_cash: expectedCash, variance, status };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { eod_post as default };
//# sourceMappingURL=eod.post.mjs.map
