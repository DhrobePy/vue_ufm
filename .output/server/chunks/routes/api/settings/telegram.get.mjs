import { q as defineEventHandler, X as getUserSession, m as createError, ap as query, T as TELEGRAM_CATEGORIES } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const telegram_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const keys = [
    "telegram_bot_token",
    "telegram_chat_id",
    ...TELEGRAM_CATEGORIES.map((c) => `telegram_chat_id_${c}`)
  ];
  const rows = await query(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN (${keys.map(() => "?").join(",")})`,
    keys
  );
  const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
  const token = (_c = map.telegram_bot_token) != null ? _c : "";
  return {
    has_token: !!token,
    token_masked: token ? `${token.slice(0, 6)}\u2026${token.slice(-4)}` : "",
    chat_id: (_d = map.telegram_chat_id) != null ? _d : "",
    categories: TELEGRAM_CATEGORIES.map((c) => {
      var _a2;
      return {
        key: c,
        chat_id: (_a2 = map[`telegram_chat_id_${c}`]) != null ? _a2 : ""
      };
    })
  };
});

export { telegram_get as default };
//# sourceMappingURL=telegram.get.mjs.map
