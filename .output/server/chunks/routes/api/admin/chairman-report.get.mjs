import { X as defineEventHandler, am as getQuery, C as buildChairmanReport, R as REPORT_TYPES } from '../../../nitro/nitro.mjs';
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

const chairmanReport_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
  const ok = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v != null ? v : ""));
  let from = ok(q.date_from) ? String(q.date_from) : today.slice(0, 8) + "01", to = ok(q.date_to) ? String(q.date_to) : today;
  if (from > to) [from, to] = [to, from];
  const type = String((_a = q.type) != null ? _a : "completed_sales");
  const built = await buildChairmanReport(type, { from, to, branch: Number(q.branch_id) || 0 });
  return { type, label: REPORT_TYPES[type], from, to, types: REPORT_TYPES, ...built };
});

export { chairmanReport_get as default };
//# sourceMappingURL=chairman-report.get.mjs.map
