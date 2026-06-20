import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid supplier ID' })

  const result = await queryOne<any>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
     - COALESCE(SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END), 0) AS available_credit
     FROM supplier_balance_adjustments
     WHERE supplier_id = ?`,
    [id],
  )

  return {
    supplier_id:      id,
    available_credit: Math.max(0, Number(result?.available_credit ?? 0)),
  }
})
