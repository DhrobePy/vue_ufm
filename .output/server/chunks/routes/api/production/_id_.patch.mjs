import { h as defineEventHandler, e as createError, I as readBody, G as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const UI_TO_DB = {
  running: "in_progress",
  paused: "delayed",
  completed: "completed",
  cancelled: "delayed",
  pending: "pending"
};
const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const rawId = ((_a = event.context.params) == null ? void 0 : _a.id) || "";
  const numericId = Number(rawId.replace(/^PS-/i, ""));
  if (!numericId) throw createError({ statusCode: 400, statusMessage: "Invalid production ID" });
  const body = await readBody(event);
  const { status, notes } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (status) {
    const dbStatus = (_b = UI_TO_DB[status]) != null ? _b : status;
    sets.push("status = ?");
    params.push(dbStatus);
    if (status === "running") {
      sets.push("production_started_at = COALESCE(production_started_at, NOW())");
    }
    if (status === "completed") {
      sets.push("production_completed_at = NOW()");
    }
  }
  if (notes !== void 0) {
    sets.push("notes = ?");
    params.push(notes);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  sets.push("updated_at = NOW()");
  params.push(numericId);
  await query(
    `UPDATE production_schedule SET ${sets.join(", ")} WHERE id = ?`,
    params
  );
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
