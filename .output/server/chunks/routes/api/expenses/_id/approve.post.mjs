import { h as defineEventHandler, v as getRouterParam, I as readBody, w as getUserSession, e as createError, H as queryOne, n as getDb } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const approve_post = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action, reason } = body != null ? body : {};
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  if (!id || !action) throw createError({ statusCode: 400, statusMessage: "id and action required" });
  const expense = await queryOne(
    "SELECT status FROM expense_vouchers WHERE id = ?",
    [id]
  );
  if (!expense) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
  const newStatus = action === "approve" ? "approved" : "rejected";
  const db = getDb();
  await db.query(
    `UPDATE expense_vouchers
     SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
         rejection_reason = ?, updated_at = NOW()
     WHERE id = ?`,
    [newStatus, userId, action === "reject" ? reason != null ? reason : null : null, id]
  );
  return { ok: true, newStatus };
});

export { approve_post as default };
//# sourceMappingURL=approve.post.mjs.map
