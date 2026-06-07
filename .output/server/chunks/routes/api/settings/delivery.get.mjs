import { h as defineEventHandler, J as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEFAULTS = {
  require_dispatch_pin: true,
  // Dispatcher must enter PIN on invoice to confirm dispatch
  require_delivery_pin: false
  // Driver-side confirmation — provisioned, not active yet
};
const delivery_get = defineEventHandler(async () => {
  var _a;
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`
    );
    if ((_a = rows[0]) == null ? void 0 : _a.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value);
      return { settings: { ...DEFAULTS, ...parsed } };
    }
  } catch {
  }
  return { settings: { ...DEFAULTS } };
});

export { delivery_get as default };
//# sourceMappingURL=delivery.get.mjs.map
