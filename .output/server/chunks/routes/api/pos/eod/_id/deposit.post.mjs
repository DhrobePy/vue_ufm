import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, at as readBody, z as getDb, g as auditLog } from '../../../../../nitro/nitro.mjs';
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

const deposit_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const userId = Number(session.user.id);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event).catch(() => ({}));
  const reference = String((_c = body == null ? void 0 : body.deposit_reference) != null ? _c : "").trim();
  if (!reference) throw createError({ statusCode: 400, statusMessage: "A deposit reference is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[row]] = await conn.query(`SELECT * FROM cash_verification_log WHERE id = ? FOR UPDATE`, [id]);
    if (!row) throw createError({ statusCode: 404, statusMessage: "EOD entry not found" });
    if (row.status !== "approved") throw createError({ statusCode: 409, statusMessage: "Only approved EOD counts can be marked deposited" });
    if (row.deposited_at) throw createError({ statusCode: 409, statusMessage: "Already marked deposited" });
    await conn.query(
      `UPDATE cash_verification_log SET deposited_at = NOW(), deposited_by_user_id = ?, deposit_reference = ? WHERE id = ?`,
      [userId, reference, id]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "other",
      recordType: "cash_verification",
      recordId: id,
      description: `EOD cash deposit confirmed \u2014 ref ${reference}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { deposit_post as default };
//# sourceMappingURL=deposit.post.mjs.map
