import { q as defineEventHandler, X as getUserSession, m as createError, at as readBody, aq as query } from '../../../nitro/nitro.mjs';
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

const tax_put = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const upsert = async (key, value) => query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value]
  );
  await upsert("tax_tin", String((_c = body == null ? void 0 : body.tin) != null ? _c : "").trim());
  await upsert("tax_bin", String((_d = body == null ? void 0 : body.bin) != null ? _d : "").trim());
  await upsert("tax_legal_name", String((_e = body == null ? void 0 : body.legal_name) != null ? _e : "").trim());
  await upsert("tax_address", String((_f = body == null ? void 0 : body.address) != null ? _f : "").trim());
  const month = Number(body == null ? void 0 : body.fiscal_year_start_month);
  if (month >= 1 && month <= 12) await upsert("tax_fiscal_year_start_month", String(month));
  return { ok: true };
});

export { tax_put as default };
//# sourceMappingURL=tax.put.mjs.map
