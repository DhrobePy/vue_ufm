import { queryOne, query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const [purchase, items] = await Promise.all([
    queryOne(`SELECT * FROM fleet_purchases WHERE id = ?`, [id]),
    query(`SELECT fpi.*, fi.item_code FROM fleet_purchase_items fpi LEFT JOIN fleet_items fi ON fi.id = fpi.item_id WHERE fpi.purchase_id = ? ORDER BY fpi.id`, [id]),
  ])

  if (!purchase) throw createError({ statusCode: 404, statusMessage: 'Purchase not found' })

  return { purchase, items }
})
