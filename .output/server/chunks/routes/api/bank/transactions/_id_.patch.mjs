import { h as defineEventHandler, v as getRouterParam, I as readBody, e as createError, n as getDb } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action, notes } = body;
  if (!["approve", "reject"].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: "action must be approve or reject" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[txn]] = await conn.query(
      `SELECT t.* FROM bank_transactions t
       WHERE t.id = ? AND t.status = 'pending'`,
      [id]
    );
    if (!txn) throw createError({ statusCode: 404, statusMessage: "Pending transaction not found" });
    const newStatus = action === "approve" ? "approved" : "rejected";
    await conn.query(
      `UPDATE bank_transactions
       SET status = ?, special_note = COALESCE(?, special_note), updated_at = NOW()
       WHERE id = ?`,
      [newStatus, notes || null, id]
    );
    await conn.commit();
    return { message: `Transaction ${action}d successfully` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
