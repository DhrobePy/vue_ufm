import { q as defineEventHandler, X as getUserSession, m as createError, a1 as isAdminRole, A as ACCOUNTS_ROLES, e as PRODUCTION_ROLES, as as readBody, z as getDb, W as getUserBranchScope } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const requirement_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_b = (_a = session.user.display_name) != null ? _a : session.user.name) != null ? _b : "";
  const role = ((_c = session.user.role) != null ? _c : "").toLowerCase();
  const allowed = isAdminRole(role) || ACCOUNTS_ROLES.includes(role) || PRODUCTION_ROLES.includes(role);
  if (!allowed) throw createError({ statusCode: 403, statusMessage: "Production or admin role required" });
  const body = await readBody(event);
  const date = String(body.date || "");
  const branchId = Number(body.branch_id);
  const variantId = Number(body.variant_id);
  const action = String(body.action || "");
  const qty = Number(body.qty);
  if (!date || !branchId || !variantId || !["set_in_hand", "add_produced"].includes(action) || !Number.isFinite(qty) || qty < 0)
    throw createError({ statusCode: 400, statusMessage: "date, branch_id, variant_id, action, qty required" });
  const conn = await getDb().getConnection();
  try {
    const scope = await getUserBranchScope(conn, userId, role);
    if (scope !== null && scope !== branchId)
      throw createError({ statusCode: 403, statusMessage: "Not your branch" });
    await conn.beginTransaction();
    if (action === "set_in_hand") {
      await conn.query(
        `INSERT INTO production_daily_stock (production_date, branch_id, variant_id, in_hand_qty)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE in_hand_qty = VALUES(in_hand_qty)`,
        [date, branchId, variantId, qty]
      );
    } else {
      await conn.query(
        `INSERT INTO production_daily_stock (production_date, branch_id, variant_id, produced_qty)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE produced_qty = produced_qty + VALUES(produced_qty)`,
        [date, branchId, variantId, qty]
      );
    }
    await conn.query(
      `INSERT INTO production_daily_log
         (production_date, branch_id, variant_id, event_type, qty, performed_by_user_id, performed_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, branchId, variantId, action === "set_in_hand" ? "in_hand_set" : "produced_added", qty, userId, userName]
    );
    await conn.commit();
    return { success: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { requirement_post as default };
//# sourceMappingURL=requirement.post.mjs.map
