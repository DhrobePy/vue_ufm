import { q as defineEventHandler, ar as readBody, m as createError, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const drivers_post = defineEventHandler(async (event) => {
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
    remarks,
    documents = [],
    employment_history = []
  } = body != null ? body : {};
  if (!full_name) throw createError({ statusCode: 400, statusMessage: "full_name is required" });
  const result = await query(
    `INSERT INTO fleet_drivers
       (full_name, mobile, nid, address, joining_date, photo_url,
        emergency_contact_name, emergency_contact_mobile,
        status, assigned_vehicle_id, remarks)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      full_name.trim(),
      mobile || null,
      nid || null,
      address || null,
      joining_date || null,
      photo_url || null,
      emergency_contact_name || null,
      emergency_contact_mobile || null,
      status || "active",
      assigned_vehicle_id ? Number(assigned_vehicle_id) : null,
      remarks || null
    ]
  );
  const driverId = result.insertId;
  for (const doc of documents) {
    if (!doc.document_type) continue;
    await query(
      `INSERT INTO driver_documents
         (driver_id, document_type, document_no, issue_date, expiry_date, issuing_authority)
       VALUES (?,?,?,?,?,?)`,
      [driverId, doc.document_type, doc.document_no || null, doc.issue_date || null, doc.expiry_date || null, doc.issuing_authority || null]
    );
  }
  for (const emp of employment_history) {
    if (!emp.company_name) continue;
    await query(
      `INSERT INTO driver_employment_history
         (driver_id, company_name, designation, start_date, end_date, remarks)
       VALUES (?,?,?,?,?,?)`,
      [driverId, emp.company_name, emp.designation || null, emp.start_date || null, emp.end_date || null, emp.remarks || null]
    );
  }
  return { ok: true, id: driverId };
});

export { drivers_post as default };
//# sourceMappingURL=drivers.post.mjs.map
