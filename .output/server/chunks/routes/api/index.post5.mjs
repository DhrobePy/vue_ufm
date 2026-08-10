import { q as defineEventHandler, X as getUserSession, e as PRODUCTION_ROLES, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, m as createError, as as readBody, ap as query } from '../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (![...PRODUCTION_ROLES, ...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const body = await readBody(event);
  const userId = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1;
  const {
    order_id,
    branch_id = 1,
    scheduled_date,
    priority_order = 0,
    notes,
    target_bags = null,
    start_immediately = false
  } = body != null ? body : {};
  if (!order_id || !scheduled_date)
    throw createError({ statusCode: 400, statusMessage: "order_id and scheduled_date are required" });
  const existing = await query(
    `SELECT id FROM production_schedule WHERE order_id = ? AND status != 'completed' LIMIT 1`,
    [Number(order_id)]
  );
  if (existing.length > 0)
    throw createError({ statusCode: 409, statusMessage: "This order is already in the production schedule" });
  const status = start_immediately ? "in_progress" : "pending";
  const result = await query(
    `INSERT INTO production_schedule
       (order_id, branch_id, scheduled_date, status, priority_order,
        production_manager_id, notes, target_bags, production_started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${start_immediately ? "NOW()" : "NULL"})`,
    [
      Number(order_id),
      Number(branch_id),
      scheduled_date,
      status,
      Number(priority_order),
      userId,
      notes || null,
      target_bags ? Number(target_bags) : null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { index_post as default };
//# sourceMappingURL=index.post5.mjs.map
