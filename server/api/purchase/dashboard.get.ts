import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [stats, recentPOs, topSuppliers, originStats] = await Promise.all([
    queryOne(
      `SELECT
         SUM(po_status NOT IN ('cancelled','completed'))               AS active_pos,
         SUM(delivery_status IN ('pending','partial'))                 AS grns_pending,
         COALESCE(SUM(balance_payable), 0)                            AS total_payable,
         COALESCE(SUM(total_received_qty) / 1000, 0)                  AS wheat_received_mt
       FROM purchase_orders_adnan`,
    ) as any,

    query(
      `SELECT o.id, o.po_number, o.po_date, o.supplier_name,
              ROUND(o.quantity_kg / 1000, 2) AS qty_mt,
              o.total_order_value AS value,
              o.po_status AS status, o.payment_status
       FROM purchase_orders_adnan o
       ORDER BY o.po_date DESC, o.id DESC
       LIMIT 8`,
    ) as any[],

    query(
      `SELECT s.id, s.company_name AS name, s.supplier_type AS type, s.status,
              COUNT(o.id)                        AS orders,
              COALESCE(SUM(o.total_order_value), 0) AS amount
       FROM suppliers s
       LEFT JOIN purchase_orders_adnan o ON o.supplier_id = s.id
       GROUP BY s.id
       ORDER BY amount DESC
       LIMIT 6`,
    ) as any[],

    query(
      `SELECT COALESCE(wheat_origin, 'Unknown') AS origin,
              COUNT(*) AS pos,
              ROUND(COALESCE(SUM(total_received_qty), 0) / 1000, 2) AS received_mt,
              COALESCE(SUM(total_order_value), 0) AS total_value
       FROM purchase_orders_adnan
       WHERE po_status != 'cancelled'
       GROUP BY wheat_origin
       ORDER BY received_mt DESC`,
    ) as any[],
  ])

  return { stats, recentPOs, topSuppliers, originStats }
})
