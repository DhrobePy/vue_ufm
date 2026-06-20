import { h as defineEventHandler, w as getRouterParam, e as createError, M as readBody, K as query } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__put = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const body = await readBody(event);
  const { rule_name, vehicle_type, interval_km, interval_days, description, is_active } = body != null ? body : {};
  if (!(rule_name == null ? void 0 : rule_name.trim())) throw createError({ statusCode: 400, statusMessage: "Rule name is required" });
  await query(
    `UPDATE preventive_maintenance_rules SET
       rule_name = ?, vehicle_type = ?, interval_km = ?, interval_days = ?, description = ?, is_active = ?
     WHERE id = ?`,
    [
      rule_name.trim(),
      vehicle_type || null,
      interval_km ? Number(interval_km) : null,
      interval_days ? Number(interval_days) : null,
      description || null,
      is_active !== false ? 1 : 0,
      id
    ]
  );
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
