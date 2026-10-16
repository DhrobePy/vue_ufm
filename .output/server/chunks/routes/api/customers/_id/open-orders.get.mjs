import { t as defineEventHandler, X as getRouterParam, p as createError, a1 as getUserSession, N as getQuery, b3 as userCanAction, ay as query } from '../../../../nitro/nitro.mjs';
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

const openOrders_get = defineEventHandler(async (event) => {
  var _a;
  const customerId = Number(getRouterParam(event, "id"));
  if (!customerId) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const wantHidden = getQuery(event).hidden === "1";
  const canHide = await userCanAction({
    userId: Number(session.user.id),
    role: String((_a = session.user.role) != null ? _a : "").toLowerCase(),
    module: "credit_sales",
    page: "collect",
    action: "hide_invoice",
    roleFallback: [],
    explicit: true
  });
  if (wantHidden && !canHide)
    throw createError({ statusCode: 403, statusMessage: "You are not allowed to view hidden invoices" });
  const orders = await query(
    `SELECT id, order_number, order_date, status, total_amount, amount_paid,
            advance_paid, balance_due,
            status IN ('goods_on_board','shipped','dispatched','delivered','completed') AS is_dispatched
     FROM credit_orders
     WHERE customer_id = ?
       AND balance_due > 0
       AND status NOT IN ('cancelled','rejected')
       AND ${wantHidden ? "" : "NOT "}EXISTS (SELECT 1 FROM credit_order_collection_hides h WHERE h.order_id = credit_orders.id)
     ORDER BY order_date ASC, id ASC`,
    [customerId]
  );
  return { orders, canHide };
});

export { openOrders_get as default };
//# sourceMappingURL=open-orders.get.mjs.map
