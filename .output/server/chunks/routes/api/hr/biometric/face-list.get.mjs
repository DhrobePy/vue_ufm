import { n as defineEventHandler, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const faceList_get = defineEventHandler(async () => {
  const rows = await query(`
    SELECT hfe.employee_id,
           hfe.created_at AS saved_at,
           CONCAT(e.first_name, ' ', e.last_name) AS name,
           e.branch_id,
           e.status AS emp_status,
           LENGTH(hfe.face_descriptor) AS raw_bytes,
           hfe.face_descriptor
    FROM hr_face_encodings hfe
    JOIN hr_employees e ON e.id = hfe.employee_id
    ORDER BY hfe.created_at DESC
  `);
  const employees = rows.map((r) => {
    let valid = false;
    try {
      const d = JSON.parse(r.face_descriptor);
      valid = Array.isArray(d) && d.length === 128 && typeof d[0] === "number";
    } catch {
    }
    const { face_descriptor: _, ...rest } = r;
    return { ...rest, valid };
  });
  return { employees, total: employees.length };
});

export { faceList_get as default };
//# sourceMappingURL=face-list.get.mjs.map
