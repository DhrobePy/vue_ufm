import { query } from '~/server/utils/db'

// Returns purchase orders that still have qty to receive — used by the GRN create form
export default defineEventHandler(async () => {
  const orders = await query(
    `SELECT id, po_number, supplier_id, supplier_name, quantity_kg,
            qty_yet_to_receive, unit_price_per_kg, total_order_value,
            balance_payable, total_paid
     FROM purchase_orders_adnan
     WHERE po_status NOT IN ('cancelled', 'closed')
     ORDER BY po_date DESC
     LIMIT 200`,
  ) as any[]

  return { orders }
})
