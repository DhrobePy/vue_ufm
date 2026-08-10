import { q as defineEventHandler, X as getUserSession, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const commodities_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const commodities = await query(
    `SELECT id, name, unit, is_sellable, inventory_account_id
     FROM purchase_commodities
     WHERE status = 'active' AND is_sellable = 1
     ORDER BY sort_order, name`
  );
  const ids = commodities.map((c) => c.id);
  if (!ids.length) return { commodities: [] };
  const ph = ids.map(() => "?").join(",");
  const [origins, stock] = await Promise.all([
    query(
      `SELECT commodity_id, origin_name FROM purchase_commodity_origins
       WHERE commodity_id IN (${ph}) ORDER BY sort_order`,
      ids
    ),
    query(
      `SELECT commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost
       FROM commodity_inventory WHERE commodity_id IN (${ph})`,
      ids
    )
  ]);
  for (const c of commodities) {
    c.origins = origins.filter((o) => o.commodity_id === c.id).map((o) => o.origin_name);
    c.stock = stock.filter((s) => s.commodity_id === c.id).map((s) => ({
      branch_id: s.branch_id,
      origin: s.origin,
      qty: Number(s.qty_on_hand),
      avg_cost: Number(s.weighted_avg_cost)
    }));
    c.ready = !!c.inventory_account_id;
  }
  return { commodities };
});

export { commodities_get as default };
//# sourceMappingURL=commodities.get.mjs.map
