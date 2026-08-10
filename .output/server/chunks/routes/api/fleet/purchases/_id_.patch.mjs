import { q as defineEventHandler, R as getRouterParam, as as readBody, m as createError, ap as query } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { status, paid_amount } = body != null ? body : {};
  const validStatuses = ["pending", "approved", "received", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  }
  if (status) {
    await query(
      `UPDATE fleet_purchases SET status = ? WHERE id = ?`,
      [status, id]
    );
    if (status === "received") {
      const items = await query(
        `SELECT * FROM fleet_purchase_items WHERE purchase_id = ?`,
        [id]
      );
      for (const item of items) {
        if (item.item_id) {
          await query(
            `UPDATE fleet_items SET current_stock = current_stock + ? WHERE id = ?`,
            [Number(item.quantity), item.item_id]
          );
        }
      }
    }
  }
  if (paid_amount !== void 0) {
    await query(
      `UPDATE fleet_purchases SET paid_amount = ? WHERE id = ?`,
      [Number(paid_amount), id]
    );
  }
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
