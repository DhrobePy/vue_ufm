import { query, queryOne, getDb } from '~/server/utils/db'
import { getUserBranchScope } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  // Production managers only see their own factory's queue
  let scopeSql = ''
  const scopeParams: any[] = []
  const session = await getUserSession(event)
  if (session?.user) {
    const conn = await getDb().getConnection()
    try {
      const scope = await getUserBranchScope(
        conn, Number((session.user as any).id), ((session.user as any).role ?? '').toLowerCase(),
      )
      if (scope !== null) {
        scopeSql = ' AND o.assigned_branch_id = ?'
        scopeParams.push(scope)
      }
    } finally {
      conn.release()
    }
  }

  const [orders, stats] = await Promise.all([
    query(
      `SELECT o.id, o.order_number, o.order_date, o.required_date,
              o.status, o.priority, o.total_amount, o.balance_due,
              o.total_weight_kg, o.production_seq,
              c.name AS customer_name,
              oi.id AS item_id,
              p.base_name AS product_name, pv.weight_variant,
              oi.quantity AS qty_bags, oi.line_total,
              oac.production_hold, oac.production_released_at, oac.production_hold_note
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN credit_order_items oi ON oi.order_id = o.id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       LEFT JOIN order_approval_conditions oac ON oac.order_id = o.id
       WHERE o.status IN ('approved','in_production')${scopeSql}
       ORDER BY
         -- Manual sequence first (0 = unset → pushed to back)
         CASE WHEN o.production_seq = 0 THEN 999999 ELSE o.production_seq END ASC,
         -- Fallback for unsequenced orders
         (o.priority = 'urgent') DESC,
         (o.priority = 'high') DESC,
         o.required_date ASC,
         o.created_at ASC
       LIMIT 100`,
      scopeParams,
    ) as any[],

    queryOne(
      `SELECT
         SUM(status = 'in_production')                                        AS in_production,
         SUM(status = 'ready_to_ship')                                        AS ready_today,
         COALESCE(SUM(CASE WHEN status = 'in_production'
                      THEN total_weight_kg ELSE 0 END), 0)                   AS total_weight_kg
       FROM credit_orders`,
    ) as any,
  ])

  // Group line items under each order
  const orderMap = new Map<number, any>()
  for (const row of orders) {
    if (!orderMap.has(row.id)) {
      orderMap.set(row.id, {
        id:            row.id,
        orderNo:       row.order_number,
        customer:      row.customer_name,
        status:        row.status,
        priority:      row.priority,
        required_date: row.required_date ?? null,
        total_amount:  row.total_amount,
        balance_due:   row.balance_due,
        totalWeightKg: row.total_weight_kg,
        production_seq: Number(row.production_seq ?? 0),
        progress:      row.status === 'in_production' ? 50 : 0,  // placeholder until production_schedule is wired
        production_hold: !!row.production_hold && !row.production_released_at,
        hold_note:     row.production_hold_note ?? null,
        items:         [],
      })
    }
    if (row.item_id) {
      orderMap.get(row.id).items.push({
        product: row.product_name ? `${row.product_name}${row.weight_variant ? ' ' + row.weight_variant : ''}` : '—',
        qty:     Number(row.qty_bags ?? 0),
      })
    }
  }

  return { orders: Array.from(orderMap.values()), stats }
})
