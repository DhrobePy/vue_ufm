import { u as defineEventHandler, aS as requireAction, a_ as runLedgerAudit, e as AUDIT_TITLES } from '../../../nitro/nitro.mjs';
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

const audit_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  await requireAction(
    event,
    { module: "customers", page: "list", action: "review_ledger", roleFallback: [], explicit: true },
    'Only admin, or a user granted "Review Ledger Lines", may open the cross-checks'
  );
  const exceptions = await runLedgerAudit();
  const groups = {};
  for (const e of exceptions) {
    const g = (_c = groups[_b = e.code]) != null ? _c : groups[_b] = { code: e.code, title: (_a = AUDIT_TITLES[e.code]) != null ? _a : e.code, severity: e.severity, n: 0, customers: /* @__PURE__ */ new Set(), amount: 0 };
    g.n++;
    g.customers.add(e.customer_id);
    g.amount += Math.abs(Number(e.amount) || 0);
  }
  const order = { high: 0, medium: 1, review: 2, info: 3 };
  return {
    groups: Object.values(groups).map((g) => ({ ...g, customers: g.customers.size })).sort((a, b) => {
      var _a2, _b2;
      return ((_a2 = order[a.severity]) != null ? _a2 : 9) - ((_b2 = order[b.severity]) != null ? _b2 : 9) || b.n - a.n;
    }),
    exceptions: exceptions.map((e) => {
      var _a2;
      return { ...e, date: String((_a2 = e.date) != null ? _a2 : "").slice(0, 10) };
    })
  };
});

export { audit_get as default };
//# sourceMappingURL=audit.get.mjs.map
