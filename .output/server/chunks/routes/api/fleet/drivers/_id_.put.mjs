import { o as defineEventHandler, L as getRouterParam, k as createError, ae as readBody, ab as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
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
  const {
    full_name,
    mobile,
    nid,
    address,
    joining_date,
    photo_url,
    emergency_contact_name,
    emergency_contact_mobile,
    status,
    assigned_vehicle_id,
    remarks
  } = body != null ? body : {};
  await query(
    `UPDATE fleet_drivers SET
       full_name = ?, mobile = ?, nid = ?, address = ?,
       joining_date = ?, photo_url = ?,
       emergency_contact_name = ?, emergency_contact_mobile = ?,
       status = ?, assigned_vehicle_id = ?, remarks = ?
     WHERE id = ?`,
    [
      (full_name == null ? void 0 : full_name.trim()) || null,
      mobile || null,
      nid || null,
      address || null,
      joining_date || null,
      photo_url || null,
      emergency_contact_name || null,
      emergency_contact_mobile || null,
      status || "active",
      assigned_vehicle_id ? Number(assigned_vehicle_id) : null,
      remarks || null,
      id
    ]
  );
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
