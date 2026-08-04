import { query } from '~/server/utils/db'

const VALID_STATUS = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']
const VALID_PAYMENT_STATUS = ['Pending', 'Partially Paid', 'Paid']

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid rental ID' })

  const body = await readBody(event)
  const { status, payment_status, notes } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (status !== undefined) {
    if (!VALID_STATUS.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    sets.push('status = ?'); params.push(status)
  }
  if (payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUS.includes(payment_status)) throw createError({ statusCode: 400, statusMessage: 'Invalid payment_status' })
    sets.push('payment_status = ?'); params.push(payment_status)
  }
  if (notes !== undefined) { sets.push('notes = ?'); params.push(notes?.trim() || null) }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  params.push(id)
  await query(`UPDATE vehicle_rentals SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`, params)

  return { ok: true }
})
