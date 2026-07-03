import { j as defineEventHandler, F as getUserSession, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const canDeliver_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const session = await getUserSession(event);
  const user = session == null ? void 0 : session.user;
  if (!(user == null ? void 0 : user.id)) return { allowed: false };
  const role = ((_a = user.role) != null ? _a : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) {
    return { allowed: true, user_name: (_c = (_b = user.display_name) != null ? _b : user.name) != null ? _c : "" };
  }
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`
    );
    const ids = ((_d = rows[0]) == null ? void 0 : _d.setting_value) ? (_e = JSON.parse(rows[0].setting_value).delivery_confirm_user_ids) != null ? _e : [] : [];
    if (ids.map(Number).includes(Number(user.id))) {
      return { allowed: true, user_name: (_g = (_f = user.display_name) != null ? _f : user.name) != null ? _g : "" };
    }
  } catch {
  }
  return { allowed: false };
});

export { canDeliver_get as default };
//# sourceMappingURL=can-deliver.get.mjs.map
