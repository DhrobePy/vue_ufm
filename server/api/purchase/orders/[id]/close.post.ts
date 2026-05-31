import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const body   = await readBody(event)
  const action = (body?.action ?? 'close') as 'close' | 'reopen'

  const po = await queryOne(
    `SELECT id, po_number, delivery_status FROM purchase_orders_adnan WHERE id = ?`, [id],
  ) as any
  if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

  if (action === 'reopen') {
    if (po.delivery_status !== 'closed') {
      throw createError({ statusCode: 400, statusMessage: 'PO is not closed — cannot reopen' })
    }
    await query(
      `UPDATE purchase_orders_adnan SET delivery_status = 'partial', updated_at = NOW() WHERE id = ?`,
      [id],
    )
    return { ok: true, message: `PO ${po.po_number} reopened — goods receipt is allowed again` }
  }

  // Default: close
  if (po.delivery_status === 'closed') {
    throw createError({ statusCode: 400, statusMessage: 'PO is already closed' })
  }
  await query(
    `UPDATE purchase_orders_adnan SET delivery_status = 'closed', updated_at = NOW() WHERE id = ?`,
    [id],
  )
  return { ok: true, message: `PO ${po.po_number} closed — no further goods can be received` }
})
