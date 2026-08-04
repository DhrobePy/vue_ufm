import { q as defineEventHandler, R as getRouterParam, ar as readBody, X as getUserSession, m as createError, z as getDb } from '../../../../nitro/nitro.mjs';
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
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    const [[existing]] = await conn.query(`SELECT * FROM bank_tx_transaction_types WHERE id = ?`, [id]);
    if (!existing) throw createError({ statusCode: 404, statusMessage: "Type not found" });
    if (body.action === "toggle") {
      await conn.query(`UPDATE bank_tx_transaction_types SET is_active = NOT is_active WHERE id = ?`, [id]);
      conn.release();
      return { message: `Type ${existing.is_active ? "deactivated" : "activated"}` };
    }
    const sets = [];
    const vals = [];
    if (body.name !== void 0) {
      sets.push("name = ?");
      vals.push(body.name);
    }
    if (body.nature !== void 0) {
      sets.push("nature = ?");
      vals.push(body.nature);
    }
    if (body.description !== void 0) {
      sets.push("description = ?");
      vals.push(body.description);
    }
    if (body.is_active !== void 0) {
      sets.push("is_active = ?");
      vals.push(body.is_active ? 1 : 0);
    }
    if (body.chart_of_account_id !== void 0) {
      sets.push("chart_of_account_id = ?");
      vals.push(body.chart_of_account_id || null);
    }
    if (sets.length) {
      await conn.query(`UPDATE bank_tx_transaction_types SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    }
    conn.release();
    return { message: "Type updated" };
  } catch (err) {
    conn.release();
    throw err;
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
