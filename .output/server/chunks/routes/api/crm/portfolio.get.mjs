import { Z as defineEventHandler, as as getQuery, bR as scopedHealth, b3 as portfolioSummary } from '../../../nitro/nitro.mjs';
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

const portfolio_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const rows = await scopedHealth(event);
  const s = String((_a = q.search) != null ? _a : "").toLowerCase().trim();
  const list = rows.filter((r) => {
    var _a2, _b, _c;
    return (!q.label || r.label === q.label) && (!q.segment || r.segment === q.segment) && (!q.district || r.district === q.district) && (!s || `${r.name} ${(_a2 = r.business_name) != null ? _a2 : ""} ${(_b = r.phone) != null ? _b : ""} ${(_c = r.address) != null ? _c : ""}`.toLowerCase().includes(s));
  }).sort((a, b) => b.priority - a.priority || b.value_12m - a.value_12m);
  return { summary: await portfolioSummary(rows), customers: list.slice(0, 500) };
});

export { portfolio_get as default };
//# sourceMappingURL=portfolio.get.mjs.map
