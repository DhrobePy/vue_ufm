import { w as defineEventHandler, a8 as getUserSession, t as createError, r as clearAllPerms, aW as resetAppSettingsCache, aX as resetTelegramCache } from '../../../nitro/nitro.mjs';
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

const clearCache_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const role = ((_c = (_b = (_a = await getUserSession(event)) == null ? void 0 : _a.user) == null ? void 0 : _b.role) != null ? _c : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) throw createError({ statusCode: 403, statusMessage: "Admin only" });
  resetAppSettingsCache();
  resetTelegramCache();
  clearAllPerms();
  return { ok: true };
});

export { clearCache_post as default };
//# sourceMappingURL=clear-cache.post.mjs.map
