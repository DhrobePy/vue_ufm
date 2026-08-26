import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, aq as query, z as getDb, B as getDeliveryQrSecret, ad as posExitQrSignature, M as getRequestURL } from '../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  const [[order], items, jeLines] = await Promise.all([
    query(
      `SELECT o.*, c.name AS customer_name, b.name AS branch_name,
              cb.display_name AS cleared_by_name, rb.display_name AS requested_by_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.branch_id
       LEFT JOIN users cb ON cb.id = o.exit_cleared_by_user_id
       LEFT JOIN users rb ON rb.id = o.exit_requested_by_user_id
       WHERE o.id = ? AND o.order_type = 'POS'`,
      [id]
    ),
    query(
      `SELECT oi.*, pv.weight_variant, pv.sku, p.base_name
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE oi.order_id = ?`,
      [id]
    ),
    query(
      `SELECT tl.*, coa.name AS account_name FROM transaction_lines tl
       JOIN chart_of_accounts coa ON coa.id = tl.account_id
       JOIN orders o ON o.journal_entry_id = tl.journal_entry_id
       WHERE o.id = ?`,
      [id]
    )
  ]);
  if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const conn = await getDb().getConnection();
  let verifyUrl = "";
  try {
    const secret = await getDeliveryQrSecret(conn);
    const sig = posExitQrSignature(order.order_number, secret);
    const origin = getRequestURL(event).origin;
    verifyUrl = `${origin}/pos/exit/${order.id}?sig=${sig}`;
  } finally {
    conn.release();
  }
  return { order, items, je_lines: jeLines, verify_url: verifyUrl };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
