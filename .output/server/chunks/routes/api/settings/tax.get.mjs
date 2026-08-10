import { q as defineEventHandler, X as getUserSession, m as createError, ap as query } from '../../../nitro/nitro.mjs';
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

const tax_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const keys = ["tax_tin", "tax_bin", "tax_legal_name", "tax_address", "tax_fiscal_year_start_month"];
  const rows = await query(
    `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${keys.map(() => "?").join(",")})`,
    keys
  );
  const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
  return {
    tin: (_c = map.tax_tin) != null ? _c : "",
    bin: (_d = map.tax_bin) != null ? _d : "",
    legal_name: (_e = map.tax_legal_name) != null ? _e : "",
    address: (_f = map.tax_address) != null ? _f : "",
    fiscal_year_start_month: Number((_g = map.tax_fiscal_year_start_month) != null ? _g : 7)
    // Bangladesh default: July
  };
});

export { tax_get as default };
//# sourceMappingURL=tax.get.mjs.map
