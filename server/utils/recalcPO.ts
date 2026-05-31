import type { PoolConnection } from 'mysql2/promise'

/**
 * Recalculates a PO's totals after GRN or payment change.
 * Mirrors PHP's JournalEntryHelper::recalculatePOTotals() + updateDeliveryStatus() + updatePaymentStatus()
 */
export async function recalcPO(conn: PoolConnection, poId: number): Promise<void> {
  await conn.query(
    `UPDATE purchase_orders_adnan po
     SET
       total_received_qty   = COALESCE(
         (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0),
       total_received_value = COALESCE(
         (SELECT SUM(total_value) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0),
       total_paid           = COALESCE(
         (SELECT SUM(amount_paid) FROM purchase_payments_adnan
          WHERE purchase_order_id = po.id), 0),
       balance_payable      = GREATEST(0, COALESCE(
         (SELECT SUM(total_value) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
         - COALESCE(
         (SELECT SUM(amount_paid) FROM purchase_payments_adnan
          WHERE purchase_order_id = po.id), 0)),
       delivery_status      = CASE
         WHEN delivery_status = 'closed' THEN 'closed'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) <= 0
              THEN 'pending'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) < po.quantity_kg
              THEN 'partial'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) <= po.quantity_kg * 1.05
              THEN 'completed'
         ELSE 'over_received'
       END,
       payment_status       = CASE
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) <= 0
              THEN 'unpaid'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) <
              COALESCE(
              (SELECT SUM(total_value) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
              THEN 'partial'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) >=
              COALESCE(
              (SELECT SUM(total_value) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
              THEN 'paid'
         ELSE 'partial'
       END,
       updated_at           = NOW()
     WHERE po.id = ?`,
    [poId],
  )
}
