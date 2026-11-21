import { Z as defineEventHandler, bD as reorderRadar, bS as scopedHealth } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const reorder_get = defineEventHandler(async (event) => {
  var _a;
  const rows = await reorderRadar(await scopedHealth(event));
  const by = {};
  for (const r of rows) by[r.status] = ((_a = by[r.status]) != null ? _a : 0) + 1;
  return { rows, counts: by, at_risk_value: rows.filter((r) => r.churn_pct >= 50).reduce((t, r) => t + r.value_at_risk, 0) };
});

export { reorder_get as default };
//# sourceMappingURL=reorder.get.mjs.map
