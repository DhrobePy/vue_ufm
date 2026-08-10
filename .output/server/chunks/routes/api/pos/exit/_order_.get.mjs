import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, J as getQuery, ap as query, z as getDb, B as getDeliveryQrSecret, aw as recordPosExitScan, K as getRequestHeader, ad as posExitQrSignature } from '../../../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _order__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const orderId = Number(getRouterParam(event, "order"));
  if (!orderId) throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  const sig = String((_b = getQuery(event).sig) != null ? _b : "");
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
  let scanCount = 0;
  try {
    secret = await getDeliveryQrSecret(conn);
    scanCount = await recordPosExitScan(conn, {
      orderId,
      orderNumber: order.order_number,
      alreadyCleared: order.exit_status === "cleared",
      scannerId: userId,
      scannerName: userName,
      ip: (_d = (_c = getRequestHeader(event, "x-forwarded-for")) != null ? _c : event.node.req.socket.remoteAddress) != null ? _d : null
    });
  } finally {
    conn.release();
  }
  const expected = posExitQrSignature(order.order_number, secret);
  const sigValid = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  return { order, sig_valid: sigValid, scan_count: scanCount };
});

export { _order__get as default };
//# sourceMappingURL=_order_.get.mjs.map
