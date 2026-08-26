import { q as defineEventHandler, aq as query } from '../../../nitro/nitro.mjs';
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

const commodities_get = defineEventHandler(async () => {
  const commodities = await query(
    `SELECT id, name, unit, inventory_account_id, status, sort_order
     FROM purchase_commodities
     WHERE status = 'active'
     ORDER BY sort_order ASC, name ASC`
  );
  if (!commodities.length) return { commodities: [] };
  const ids = commodities.map((c) => c.id);
  const placeholders = ids.map(() => "?").join(",");
  const [origins, links] = await Promise.all([
    query(
      `SELECT commodity_id, origin_name FROM purchase_commodity_origins
       WHERE commodity_id IN (${placeholders}) ORDER BY sort_order ASC, origin_name ASC`,
      ids
    ),
    query(
      `SELECT commodity_id, supplier_id FROM supplier_commodities
       WHERE commodity_id IN (${placeholders})`,
      ids
    )
  ]);
  return {
    commodities: commodities.map((c) => ({
      ...c,
      origins: origins.filter((o) => o.commodity_id === c.id).map((o) => o.origin_name),
      supplier_ids: links.filter((l) => l.commodity_id === c.id).map((l) => l.supplier_id)
    }))
  };
});

export { commodities_get as default };
//# sourceMappingURL=commodities.get.mjs.map
