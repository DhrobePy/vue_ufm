import { q as defineEventHandler, as as readBody, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
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

const employees_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    position_id,
    hire_date,
    base_salary,
    branch_id,
    status = "active"
  } = body != null ? body : {};
  if (!first_name || !last_name || !email || !hire_date)
    throw createError({ statusCode: 400, statusMessage: "first_name, last_name, email, and hire_date are required" });
  const result = await query(
    `INSERT INTO employees
       (first_name, last_name, email, phone, address,
        position_id, hire_date, base_salary, branch_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      phone || null,
      address || null,
      position_id ? Number(position_id) : null,
      hire_date,
      base_salary ? Number(base_salary) : 0,
      branch_id ? Number(branch_id) : 1,
      status
    ]
  );
  return { ok: true, id: result.insertId };
});

export { employees_post as default };
//# sourceMappingURL=employees.post.mjs.map
