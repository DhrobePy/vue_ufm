import { q as defineEventHandler, R as getRouterParam, m as createError, ao as queryOne, an as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [request, tasks, materials] = await Promise.all([
    queryOne(
      `SELECT mr.*, v.registration_no AS vehicle_no, v.vehicle_type
       FROM maintenance_requests mr
       JOIN fleet_vehicles v ON v.id = mr.vehicle_id
       WHERE mr.id = ?`,
      [id]
    ),
    query(`SELECT * FROM maintenance_tasks WHERE maintenance_id = ? ORDER BY id`, [id]),
    query(`SELECT * FROM maintenance_materials WHERE maintenance_id = ? ORDER BY id`, [id])
  ]);
  if (!request) throw createError({ statusCode: 404, statusMessage: "Maintenance request not found" });
  return { request, tasks, materials };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
