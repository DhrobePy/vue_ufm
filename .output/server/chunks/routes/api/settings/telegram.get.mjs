import { o as defineEventHandler, O as getUserSession, k as createError, ab as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const telegram_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const rows = await query(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id')`
  );
  const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
  const token = (_c = map.telegram_bot_token) != null ? _c : "";
  return {
    has_token: !!token,
    token_masked: token ? `${token.slice(0, 6)}\u2026${token.slice(-4)}` : "",
    chat_id: (_d = map.telegram_chat_id) != null ? _d : ""
  };
});

export { telegram_get as default };
//# sourceMappingURL=telegram.get.mjs.map
