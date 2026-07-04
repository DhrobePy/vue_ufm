import { m as defineEventHandler, a1 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const descriptors_get = defineEventHandler(async () => {
  const rows = await query(`
    SELECT hfe.employee_id,
           hfe.face_descriptor AS descriptor,
           CONCAT(e.first_name, ' ', e.last_name) AS name,
           e.branch_id
    FROM hr_face_encodings hfe
    JOIN hr_employees e ON e.id = hfe.employee_id
    WHERE e.status = 'active'
      AND hfe.face_descriptor IS NOT NULL
  `);
  const valid = [];
  for (const r of rows) {
    try {
      const d = typeof r.descriptor === "string" ? JSON.parse(r.descriptor) : r.descriptor;
      if (!Array.isArray(d) || d.length !== 128 || typeof d[0] !== "number") continue;
      valid.push({ ...r, descriptor: d.map(Number) });
    } catch {
    }
  }
  return { success: true, employees: valid, count: valid.length };
});

export { descriptors_get as default };
//# sourceMappingURL=descriptors.get.mjs.map
