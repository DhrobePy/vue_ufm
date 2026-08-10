import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, ap as query } from '../../../../nitro/nitro.mjs';
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

const openOrders_get = defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, "id"));
  if (!customerId) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const orders = await query(
    `SELECT id, order_number, order_date, status, total_amount, amount_paid,
            advance_paid, balance_due,
            status IN ('goods_on_board','shipped','dispatched','delivered','completed') AS is_dispatched
     FROM credit_orders
     WHERE customer_id = ?
       AND balance_due > 0
       AND status NOT IN ('cancelled','rejected')
     ORDER BY order_date ASC, id ASC`,
    [customerId]
  );
  return { orders };
});

export { openOrders_get as default };
//# sourceMappingURL=open-orders.get.mjs.map
