import { q as defineEventHandler, m as createError, aq as readBody, an as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a;
  const id = Number((_a = event.context.params) == null ? void 0 : _a.id);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid subcategory ID" });
  const body = await readBody(event);
  const { name, unit_of_measurement, chart_of_account_id, is_active } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (name !== void 0) {
    sets.push("subcategory_name = ?");
    params.push(String(name).trim());
  }
  if (unit_of_measurement !== void 0) {
    sets.push("unit_of_measurement = ?");
    params.push(unit_of_measurement || null);
  }
  if (chart_of_account_id !== void 0) {
    sets.push("chart_of_account_id = ?");
    params.push(chart_of_account_id || null);
  }
  if (is_active !== void 0) {
    sets.push("is_active = ?");
    params.push(is_active ? 1 : 0);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  params.push(id);
  await query(
    `UPDATE expense_subcategories SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`,
    params
  );
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
