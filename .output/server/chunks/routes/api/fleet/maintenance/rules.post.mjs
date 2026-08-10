import { q as defineEventHandler, as as readBody, m as createError, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const rules_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rule_name, vehicle_type, interval_km, interval_days, description, is_active } = body != null ? body : {};
  if (!(rule_name == null ? void 0 : rule_name.trim())) throw createError({ statusCode: 400, statusMessage: "Rule name is required" });
  const result = await query(
    `INSERT INTO preventive_maintenance_rules (rule_name, vehicle_type, interval_km, interval_days, description, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      rule_name.trim(),
      vehicle_type || null,
      interval_km ? Number(interval_km) : null,
      interval_days ? Number(interval_days) : null,
      description || null,
      is_active !== false ? 1 : 0
    ]
  );
  return { ok: true, id: result.insertId };
});

export { rules_post as default };
//# sourceMappingURL=rules.post.mjs.map
