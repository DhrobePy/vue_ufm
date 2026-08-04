import { query } from '~/server/utils/db'

/**
 * PATCH /api/expenses/subcategories/:id
 * Currently only used to link/unlink a subcategory's GL account override —
 * a subcategory's chart_of_account_id takes priority over its parent
 * category's when a voucher is approved (see expenses/[id]/approve.post.ts).
 */
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid subcategory ID' })

  const body = await readBody(event)
  const { name, unit_of_measurement, chart_of_account_id, is_active } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (name                 !== undefined) { sets.push('subcategory_name = ?');    params.push(String(name).trim()) }
  if (unit_of_measurement  !== undefined) { sets.push('unit_of_measurement = ?'); params.push(unit_of_measurement || null) }
  if (chart_of_account_id  !== undefined) { sets.push('chart_of_account_id = ?'); params.push(chart_of_account_id || null) }
  if (is_active            !== undefined) { sets.push('is_active = ?');           params.push(is_active ? 1 : 0) }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  params.push(id)
  await query(
    `UPDATE expense_subcategories SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
    params,
  )

  return { ok: true }
})
