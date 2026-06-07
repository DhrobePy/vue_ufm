import { h as defineEventHandler, L as readBody, J as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const delivery_put = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { require_dispatch_pin, require_delivery_pin } = body != null ? body : {};
  const settings = {
    require_dispatch_pin: require_dispatch_pin !== void 0 ? Boolean(require_dispatch_pin) : true,
    require_delivery_pin: require_delivery_pin !== void 0 ? Boolean(require_delivery_pin) : false
  };
  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('delivery_verification', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [JSON.stringify(settings)]
  );
  return { ok: true, settings };
});

export { delivery_put as default };
//# sourceMappingURL=delivery.put.mjs.map
