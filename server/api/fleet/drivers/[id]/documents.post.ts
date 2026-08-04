import { query } from '~/server/utils/db'

/** POST /api/fleet/drivers/:id/documents — add a document after driver creation. */
export default defineEventHandler(async (event) => {
  const driverId = Number(getRouterParam(event, 'id'))
  if (!driverId) throw createError({ statusCode: 400, statusMessage: 'Invalid driver ID' })

  const body = await readBody(event)
  const { document_type, document_number, issue_date, expiry_date, notes } = body ?? {}
  if (!document_type) throw createError({ statusCode: 400, statusMessage: 'document_type is required' })

  const result = await query(
    `INSERT INTO driver_documents (driver_id, document_type, document_number, issue_date, expiry_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [driverId, document_type, document_number || null, issue_date || null, expiry_date || null, notes || null],
  ) as any

  return { ok: true, id: result.insertId }
})
