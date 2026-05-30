import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readBody(event)
  const {
    full_name, mobile, nid, address, joining_date, photo_url,
    emergency_contact_name, emergency_contact_mobile,
    status, assigned_vehicle_id, remarks,
  } = body ?? {}

  await query(
    `UPDATE fleet_drivers SET
       full_name = ?, mobile = ?, nid = ?, address = ?,
       joining_date = ?, photo_url = ?,
       emergency_contact_name = ?, emergency_contact_mobile = ?,
       status = ?, assigned_vehicle_id = ?, remarks = ?
     WHERE id = ?`,
    [
      full_name?.trim() || null,
      mobile           || null,
      nid              || null,
      address          || null,
      joining_date     || null,
      photo_url        || null,
      emergency_contact_name   || null,
      emergency_contact_mobile || null,
      status           || 'active',
      assigned_vehicle_id ? Number(assigned_vehicle_id) : null,
      remarks          || null,
      id,
    ],
  )

  return { ok: true }
})
