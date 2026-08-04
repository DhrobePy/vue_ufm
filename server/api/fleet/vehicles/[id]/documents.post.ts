import { query } from '~/server/utils/db'

/** POST /api/fleet/vehicles/:id/documents — add a document after vehicle creation. */
export default defineEventHandler(async (event) => {
  const vehicleId = Number(getRouterParam(event, 'id'))
  if (!vehicleId) throw createError({ statusCode: 400, statusMessage: 'Invalid vehicle ID' })

  const body = await readBody(event)
  const { document_type, document_number, issue_date, expiry_date, notes } = body ?? {}
  if (!document_type) throw createError({ statusCode: 400, statusMessage: 'document_type is required' })

  const result = await query(
    `INSERT INTO vehicle_documents (vehicle_id, document_type, document_number, issue_date, expiry_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [vehicleId, document_type, document_number || null, issue_date || null, expiry_date || null, notes || null],
  ) as any

  return { ok: true, id: result.insertId }
})
