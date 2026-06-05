import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id        = Number(getRouterParam(event, 'id'))
  const session   = await getUserSession(event)
  const role      = (session?.user?.role ?? '').toLowerCase()
  const userId    = session?.user?.id ?? 1
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can delete orders' })
  }
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // order_deletion_log table guaranteed by db-migrate startup plugin.

    // Load order + customer + deleting user — all the info we want to preserve
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.customer_id, o.order_number,
              o.total_amount, o.amount_paid, o.balance_due,
              CASE WHEN o.status = 'delivered' AND o.balance_due = 0
                   THEN 'completed' ELSE o.status END AS order_status,
              c.name AS customer_name,
              u.display_name AS deleted_by_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = ?
       WHERE o.id = ?`,
      [userId, id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // ── System audit log (visible on /admin/audit) ─────────────────────
    const auditAmt = Number(order.total_amount).toLocaleString()
    await auditLog(conn, {
      userId,
      action:          'order_deleted',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: order.order_number,
      description:     `Order ${order.order_number} deleted — ${order.customer_name} · ৳${auditAmt} · status was ${order.order_status}`,
      severity:        'critical',
      ipAddress,
    })

    // ── Write tombstone BEFORE cascade delete ──────────────────────────────
    // Use UTC_TIMESTAMP() explicitly — avoids MySQL server-TZ drift that
    // causes negative "Xs ago" in the notification bell.
    await conn.query(
      `INSERT INTO order_deletion_log
         (order_id, order_number, customer_id, customer_name,
          total_amount, amount_paid, balance_due, order_status,
          deleted_by_user_id, deleted_by_name, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        id, order.order_number, order.customer_id, order.customer_name,
        order.total_amount, order.amount_paid, order.balance_due, order.order_status,
        userId, order.deleted_by_name ?? null,
      ],
    )

    // ── Cascade delete ─────────────────────────────────────────────────────

    // 1. Delivery items
    const [deliveries] = await conn.query<any[]>(
      `SELECT id FROM credit_order_deliveries WHERE order_id = ?`, [id],
    )
    for (const d of deliveries as any[]) {
      await conn.query(`DELETE FROM credit_order_delivery_items WHERE delivery_id = ?`, [d.id])
    }
    await conn.query(`DELETE FROM credit_order_deliveries WHERE order_id = ?`, [id])

    // 2. Return items
    const [returns] = await conn.query<any[]>(
      `SELECT id FROM credit_order_returns WHERE order_id = ?`, [id],
    )
    for (const r of returns as any[]) {
      await conn.query(`DELETE FROM credit_order_return_items WHERE return_id = ?`, [r.id])
    }
    await conn.query(`DELETE FROM credit_order_returns WHERE order_id = ?`, [id])

    // 3. Workflow history
    await conn.query(`DELETE FROM credit_order_workflow WHERE order_id = ?`, [id])

    // 4. Audit trail (order-level)
    await conn.query(`DELETE FROM credit_order_audit WHERE order_id = ?`, [id])

    // 5. Ledger entries tied to deliveries or the order directly
    await conn.query(
      `DELETE FROM customer_ledger
       WHERE reference_type IN ('credit_order','credit_order_delivery')
         AND reference_id IN (
           SELECT id FROM credit_order_deliveries WHERE order_id = ?
           UNION ALL SELECT ? AS id
         )`,
      [id, id],
    )
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
         (SELECT SUM(debit_amount) - SUM(credit_amount)
          FROM customer_ledger WHERE customer_id = ?),
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
