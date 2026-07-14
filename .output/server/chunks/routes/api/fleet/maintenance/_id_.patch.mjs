import { n as defineEventHandler, H as getRouterParam, a7 as readBody, j as createError, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { status } = body;
  if (!["pending", "in_progress", "completed", "cancelled"].includes(status))
    throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  if (status === "completed") (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  await query(
    `UPDATE maintenance_requests SET status = ?, completed_date = ${status === "completed" ? "CURDATE()" : "completed_date"} WHERE id = ?`,
    [status, id]
  );
  if (status === "completed") {
    const [maint] = await query(`SELECT vehicle_id FROM maintenance_requests WHERE id = ?`, [id]);
    if (maint) {
      await query(
        `UPDATE fleet_vehicles SET status = 'available' WHERE id = ? AND status = 'repair'`,
        [maint.vehicle_id]
      );
    }
  }
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
