import { q as defineEventHandler, as as readBody, m as createError, X as getUserSession, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const body = await readBody(event);
  if (!((_a = body.name) == null ? void 0 : _a.trim())) throw createError({ statusCode: 422, statusMessage: "Type name is required" });
  const session = await getUserSession(event);
  const userId = (_c = (_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id) != null ? _c : 1;
  const role = ((_e = (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.role) != null ? _e : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const db = getDb();
  const [result] = await db.query(
    `INSERT INTO bank_tx_transaction_types (name, nature, description, chart_of_account_id, is_active, created_by_user_id)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [body.name.trim(), body.nature || "other", body.description || null, body.chart_of_account_id || null, userId]
  );
  return { id: result.insertId, message: "Transaction type created" };
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
