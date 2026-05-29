import { query } from '~/server/utils/db'

// Map form license class values → DB enum
const LICENSE_MAP: Record<string, string> = {
  light:        'Light',
  medium:       'Medium',
  heavy:        'Heavy',
  professional: 'Special',
  Special:      'Special',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    driver_name,
    phone_number,
    nid_number,
    date_of_birth,
    address,
    license_number,
    license_type,
    license_expiry_date,
    driver_type = 'Permanent',
    assigned_branch_id,
    salary,
    emergency_contact_name,
    emergency_contact_phone,
    notes,
  } = body ?? {}

  if (!driver_name || !phone_number || !license_number || !license_expiry_date)
    throw createError({ statusCode: 400, statusMessage: 'driver_name, phone_number, license_number, and license_expiry_date are required' })

  const mappedLicenseType = LICENSE_MAP[license_type] ?? 'Light'

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
      nid_number    || null,
      date_of_birth || null,
      address       || null,
      license_number,
      mappedLicenseType,
      license_expiry_date,
      driver_type,
      assigned_branch_id ? Number(assigned_branch_id) : null,
      salary ? Number(salary) : null,
      emergency_contact_name  || null,
      emergency_contact_phone || null,
      notes || null,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})
