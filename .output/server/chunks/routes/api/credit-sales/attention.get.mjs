import { u as defineEventHandler, l as branchScopeFor, aA as query } from '../../../nitro/nitro.mjs';
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

const attention_get = defineEventHandler(async (event) => {
  const sc = await branchScopeFor(event, "assigned_branch_id");
  const sco = await branchScopeFor(event, "co.assigned_branch_id");
  const count = async (sql, params = []) => {
    var _a, _b;
    try {
      return Number((_b = (_a = (await query(sql, params))[0]) == null ? void 0 : _a.c) != null ? _b : 0);
    } catch {
      return 0;
    }
  };
  const [escalated, holds, returns, overDeliveries, amendments, paymentApprovals, overdue] = await Promise.all([
    count(`SELECT COUNT(*) c FROM credit_orders WHERE status = 'escalated'${sc.sql}`, sc.params),
    count(`SELECT COUNT(*) c FROM order_approval_conditions oac JOIN credit_orders co ON co.id = oac.order_id
           WHERE oac.dispatch_hold = 1 AND oac.dispatch_cleared = 0 AND co.status IN ('approved','in_production','produced','ready_to_ship')${sco.sql}`, sco.params),
    count(`SELECT COUNT(*) c FROM credit_order_returns WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_order_over_deliveries WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM order_amendments WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_pending_requests WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_orders WHERE status IN ('approved','in_production','produced','ready_to_ship','shipped') AND required_date < CURDATE()${sc.sql}`, sc.params)
  ]);
  return { escalated, holds, returns, overDeliveries, amendments, paymentApprovals, overdue };
});

export { attention_get as default };
//# sourceMappingURL=attention.get.mjs.map
