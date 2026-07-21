import { o as defineEventHandler, ac as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEFAULTS = {
  dispatch_global_hold: true,
  // every order held from dispatch until Accounts/Admin explicitly clears it
  credit_limit_auto_release: false
  // over-limit orders auto-clear once the customer's balance is back within limit
};
const creditWorkflow_get = defineEventHandler(async () => {
  var _a;
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'credit_workflow_policy'`
    );
    if ((_a = rows[0]) == null ? void 0 : _a.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value);
      return { settings: { ...DEFAULTS, ...parsed } };
    }
  } catch {
  }
  return { settings: { ...DEFAULTS } };
});

export { creditWorkflow_get as default };
//# sourceMappingURL=credit-workflow.get.mjs.map
