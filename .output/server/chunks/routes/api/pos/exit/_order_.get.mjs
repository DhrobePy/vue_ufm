import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, J as getQuery, ao as query, z as getDb, B as getDeliveryQrSecret, ac as posExitQrSignature } from '../../../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _order__get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const orderId = Number(getRouterParam(event, "order"));
  if (!orderId) throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  const sig = String((_a = getQuery(event).sig) != null ? _a : "");
  const [[order]] = await query(
    `SELECT o.*, c.name AS customer_name, b.name AS branch_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN branches b ON b.id = o.branch_id
     WHERE o.id = ? AND o.order_type = 'POS'`,
    [orderId]
  );
  if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const conn = await getDb().getConnection();
  let secret;
  try {
    secret = await getDeliveryQrSecret(conn);
  } finally {
    conn.release();
  }
  const expected = posExitQrSignature(order.order_number, secret);
  const sigValid = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  return { order, sig_valid: sigValid };
});

export { _order__get as default };
//# sourceMappingURL=_order_.get.mjs.map
