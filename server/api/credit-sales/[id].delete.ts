import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  const role    = (session?.user?.role ?? '').toLowerCase()

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can delete orders' })
  }
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Fetch order to get customer_id
    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, order_number FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // 1. Fetch delivery IDs for cascade
    const [deliveries] = await conn.query<any[]>(
      `SELECT id FROM credit_order_deliveries WHERE order_id = ?`, [id],
    )
    for (const d of deliveries as any[]) {
      await conn.query(`DELETE FROM credit_order_delivery_items WHERE delivery_id = ?`, [d.id])
    }
    await conn.query(`DELETE FROM credit_order_deliveries WHERE order_id = ?`, [id])

    // 2. Fetch return IDs for cascade
    const [returns] = await conn.query<any[]>(
      `SELECT id FROM credit_order_returns WHERE order_id = ?`, [id],
    )
    for (const r of returns as any[]) {
      await conn.query(`DELETE FROM credit_order_return_items WHERE return_id = ?`, [r.id])
    }
    await conn.query(`DELETE FROM credit_order_returns WHERE order_id = ?`, [id])

    // 3. Workflow history
    await conn.query(`DELETE FROM credit_order_workflow WHERE order_id = ?`, [id])

    // 4. Audit trail
    await conn.query(`DELETE FROM credit_order_audit WHERE order_id = ?`, [id])

    // 5. Ledger entries tied to this order (invoices posted on delivery)
    await conn.query(
      `DELETE FROM customer_ledger WHERE reference_type IN ('credit_order','credit_order_delivery') AND reference_id IN (
         SELECT id FROM credit_order_deliveries WHERE order_id = ?
         UNION ALL
         SELECT ? AS id
       )`,
      [id, id],
    )
    // Also remove direct reference to the order itself
    await conn.query(
      `DELETE FROM customer_ledger WHERE reference_type = 'credit_order' AND reference_id = ?`,
      [id],
    )

    // 6. Order items
    await conn.query(`DELETE FROM credit_order_items WHERE order_id = ?`, [id])

    // 7. The order itself
    await conn.query(`DELETE FROM credit_orders WHERE id = ?`, [id])

    // 8. Recalculate customer balance from remaining ledger entries
    await conn.query(
      `UPDATE customers
       SET current_balance = COALESCE(
         (SELECT SUM(debit_amount) - SUM(credit_amount) FROM customer_ledger WHERE customer_id = ?),
         0),
           updated_at = NOW()
       WHERE id = ?`,
      [order.customer_id, order.customer_id],
    )

    await conn.commit()
    return { ok: true, deleted: order.order_number }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
