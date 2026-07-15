import { o as defineEventHandler, ac as readBody, k as createError, aa as queryOne, w as getDb, a9 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "create") {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      position_id,
      hire_date,
      base_salary,
      status,
      branch_id,
      bank_name,
      bank_account,
      bank_branch,
      nid,
      dob,
      gender,
      blood_group,
      device_pin,
      emergency_contact
    } = body;
    if (!first_name || !hire_date)
      throw createError({ statusCode: 400, statusMessage: "first_name and hire_date required" });
    if (email) {
      const existing = await queryOne("SELECT id FROM hr_employees WHERE email = ?", [email]);
      if (existing) throw createError({ statusCode: 400, statusMessage: "Email already exists" });
    }
    const [res] = await getDb().query(
      `INSERT INTO hr_employees
       (first_name, last_name, email, phone, address, position_id, hire_date, base_salary, status,
        branch_id, bank_name, bank_account, bank_branch, nid, dob, gender, blood_group, device_pin, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name || "",
        email || null,
        phone || null,
        address || null,
        position_id || null,
        hire_date,
        Number(base_salary) || 0,
        status || "active",
        branch_id || 1,
        bank_name || "",
        bank_account || "",
        bank_branch || "",
        nid || null,
        dob || null,
        gender || null,
        blood_group || null,
        device_pin || null,
        emergency_contact || null
      ]
    );
    return { ok: true, id: res.insertId, message: "Employee created." };
  }
  if (action === "update") {
    const {
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      position_id,
      hire_date,
      base_salary,
      status,
      branch_id,
      bank_name,
      bank_account,
      bank_branch,
      nid,
      dob,
      gender,
      blood_group,
      device_pin,
      emergency_contact
    } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query(
      `UPDATE hr_employees SET
         first_name=?, last_name=?, email=?, phone=?, address=?,
         position_id=?, hire_date=?, base_salary=?, status=?,
         branch_id=?, bank_name=?, bank_account=?, bank_branch=?,
         nid=?, dob=?, gender=?, blood_group=?, device_pin=?, emergency_contact=?
       WHERE id=?`,
      [
        first_name,
        last_name || "",
        email || null,
        phone || null,
        address || null,
        position_id || null,
        hire_date,
        Number(base_salary) || 0,
        status || "active",
        branch_id || 1,
        bank_name || "",
        bank_account || "",
        bank_branch || "",
        nid || null,
        dob || null,
        gender || null,
        blood_group || null,
        device_pin || null,
        emergency_contact || null,
        id
      ]
    );
    return { ok: true, message: "Employee updated." };
  }
  if (action === "terminate") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("UPDATE hr_employees SET status = 'terminated' WHERE id = ?", [id]);
    return { ok: true, message: "Employee terminated." };
  }
  if (action === "delete") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("UPDATE hr_employees SET status = 'terminated' WHERE id = ?", [id]);
    return { ok: true, message: "Employee terminated." };
  }
  if (action === "create_dept") {
    const { name } = body;
    if (!name) throw createError({ statusCode: 400, statusMessage: "name required" });
    const [res] = await getDb().query("INSERT INTO hr_departments (name) VALUES (?)", [name]);
    return { ok: true, id: res.insertId, message: "Department created." };
  }
  if (action === "update_dept") {
    const { id, name } = body;
    if (!id || !name) throw createError({ statusCode: 400, statusMessage: "id and name required" });
    await query("UPDATE hr_departments SET name = ? WHERE id = ?", [name, id]);
    return { ok: true, message: "Department updated." };
  }
  if (action === "delete_dept") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("DELETE FROM hr_departments WHERE id = ?", [id]);
    return { ok: true, message: "Department deleted." };
  }
  if (action === "create_pos") {
    const { name, department_id } = body;
    if (!name) throw createError({ statusCode: 400, statusMessage: "name required" });
    const [res] = await getDb().query(
      "INSERT INTO hr_positions (name, department_id) VALUES (?, ?)",
      [name, department_id || null]
    );
    return { ok: true, id: res.insertId, message: "Position created." };
  }
  if (action === "update_pos") {
    const { id, name, department_id } = body;
    if (!id || !name) throw createError({ statusCode: 400, statusMessage: "id and name required" });
    await query("UPDATE hr_positions SET name = ?, department_id = ? WHERE id = ?", [name, department_id || null, id]);
    return { ok: true, message: "Position updated." };
  }
  if (action === "delete_pos") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("DELETE FROM hr_positions WHERE id = ?", [id]);
    return { ok: true, message: "Position deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post5.mjs.map
