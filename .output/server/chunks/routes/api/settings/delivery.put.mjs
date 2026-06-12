import { h as defineEventHandler, w as getUserSession, e as createError, L as readBody, J as query } from '../../../nitro/nitro.mjs';
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
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admins can change delivery settings" });
  }
  const body = await readBody(event);
  const { require_dispatch_pin, delivery_confirm_user_ids } = body != null ? body : {};
  const settings = {
    require_dispatch_pin: require_dispatch_pin !== void 0 ? Boolean(require_dispatch_pin) : true,
    delivery_confirm_user_ids: Array.isArray(delivery_confirm_user_ids) ? delivery_confirm_user_ids.map(Number).filter((n) => Number.isFinite(n) && n > 0) : []
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
