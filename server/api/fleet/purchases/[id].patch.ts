import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { status, paid_amount } = body ?? {}

  const validStatuses = ['pending', 'approved', 'received', 'cancelled']
  if (status && !validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  if (status) {
    await query(
      `UPDATE fleet_purchases SET status = ? WHERE id = ?`,
      [status, id],
    )

    // When received: add to fleet_items stock
    if (status === 'received') {
      const items = await query<any>(
        `SELECT * FROM fleet_purchase_items WHERE purchase_id = ?`, [id],
      )
      for (const item of items) {
        if (item.item_id) {
          await query(
            `UPDATE fleet_items SET current_stock = current_stock + ? WHERE id = ?`,
            [Number(item.quantity), item.item_id],
          )
        }
      }
    }
  }

  if (paid_amount !== undefined) {
    await query(
      `UPDATE fleet_purchases SET paid_amount = ? WHERE id = ?`,
      [Number(paid_amount), id],
    )
  }

  return { ok: true }
})
