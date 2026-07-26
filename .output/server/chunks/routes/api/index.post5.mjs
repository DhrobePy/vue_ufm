import { p as defineEventHandler, am as readBody, V as getUserSession, l as createError, aj as query } from '../../nitro/nitro.mjs';
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
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    order_id,
    branch_id = 1,
    scheduled_date,
    priority_order = 0,
    notes
  } = body != null ? body : {};
  if (!order_id || !scheduled_date)
    throw createError({ statusCode: 400, statusMessage: "order_id and scheduled_date are required" });
  const existing = await query(
    `SELECT id FROM production_schedule WHERE order_id = ? AND status != 'completed' LIMIT 1`,
    [Number(order_id)]
  );
  if (existing.length > 0)
    throw createError({ statusCode: 409, statusMessage: "This order is already in the production schedule" });
  const result = await query(
    `INSERT INTO production_schedule
       (order_id, branch_id, scheduled_date, status, priority_order,
        production_manager_id, notes)
     VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
    [
      Number(order_id),
      Number(branch_id),
      scheduled_date,
      Number(priority_order),
      userId,
      notes || null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { index_post as default };
//# sourceMappingURL=index.post5.mjs.map
