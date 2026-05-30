import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const status = q.status as string | undefined

  const conditions: string[] = []
  const params: any[]        = []

  if (status && status !== 'all') {
    conditions.push('fp.status = ?')
    params.push(status)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const purchases = await query<any>(
    `SELECT fp.*,
            COUNT(fpi.id) AS item_count
     FROM fleet_purchases fp
     LEFT JOIN fleet_purchase_items fpi ON fpi.purchase_id = fp.id
     ${where}
     GROUP BY fp.id
     ORDER BY fp.purchase_date DESC, fp.id DESC
     LIMIT 200`,
    params,
  )

  // Stats
  const [stats] = await query<any>(
    `SELECT
       COUNT(*)                                          AS total,
       SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status='approved'  THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status='received'  THEN 1 ELSE 0 END) AS received,
       SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
       COALESCE(SUM(total_amount),0) AS total_value,
       COALESCE(SUM(paid_amount),0)  AS total_paid
     FROM fleet_purchases`,
    [],
  )

  return { purchases, stats }
})
