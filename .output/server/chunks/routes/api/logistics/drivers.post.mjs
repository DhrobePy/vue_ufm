import { g as defineEventHandler, G as readBody, d as createError, E as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const LICENSE_MAP = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
  professional: "Special",
  Special: "Special"
};
const drivers_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const {
    driver_name,
    phone_number,
    nid_number,
    date_of_birth,
    address,
    license_number,
    license_type,
    license_expiry_date,
    driver_type = "Permanent",
    assigned_branch_id,
    salary,
    emergency_contact_name,
    emergency_contact_phone,
    notes
  } = body != null ? body : {};
  if (!driver_name || !phone_number || !license_number || !license_expiry_date)
    throw createError({ statusCode: 400, statusMessage: "driver_name, phone_number, license_number, and license_expiry_date are required" });
  const mappedLicenseType = (_a = LICENSE_MAP[license_type]) != null ? _a : "Light";
  const result = await query(
    `INSERT INTO drivers
       (driver_name, phone_number, nid_number, date_of_birth, address,
        license_number, license_type, license_expiry_date,
        driver_type, status, assigned_branch_id,
        salary, emergency_contact_name, emergency_contact_phone, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?)`,
    [
      driver_name.trim(),
      phone_number,
      nid_number || null,
      date_of_birth || null,
      address || null,
      license_number,
      mappedLicenseType,
      license_expiry_date,
      driver_type,
      assigned_branch_id ? Number(assigned_branch_id) : null,
      salary ? Number(salary) : null,
      emergency_contact_name || null,
      emergency_contact_phone || null,
      notes || null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { drivers_post as default };
//# sourceMappingURL=drivers.post.mjs.map
