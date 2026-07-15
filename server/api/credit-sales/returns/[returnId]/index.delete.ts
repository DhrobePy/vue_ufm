import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize, serializeRow } from '~/server/utils/recycleBin'

/**
 * DELETE /api/credit-sales/returns/:returnId
 * Admin / superadmin only.
 *
 * Pending / rejected returns  → delete with no accounting side-effects.
 * Approved returns            → fully reverse all ledger / balance effects first,
 *                               then delete.
 */
export default defineEventHandler(async (event) => {
  const returnId = Number(getRouterParam(event, 'returnId'))
  if (!returnId) throw createError({ statusCode: 400, statusMessage: 'Invalid return ID' })

  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const role      = (session?.user?.role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can delete returns' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the return
    const [[ret]] = await conn.query<any>(
      `SELECT r.*, o.order_number, o.customer_id
       FROM credit_order_returns r
       JOIN credit_orders o ON o.id = r.order_id
       WHERE r.id = ?`,
      [returnId],
    )
    if (!ret) throw createError({ statusCode: 404, statusMessage: 'Return not found' })

    const retAmount = Number(ret.total_returned_amount)

    const batchId = await recycleBegin(conn, {
      entityType: 'credit_order_return', label: ret.return_number ?? `Return-${returnId}`,
      customerId: ret.customer_id, userId, userName: (session?.user as any)?.name ?? `User ${userId}`,
    })

    // ── Approved returns need full reversal before deletion ──────────────────
    if (ret.status === 'approved') {
      // 1. Remove the credit note from customer_ledger
      //    (reference_type = 'credit_order_return', reference_id = returnId) —
      //    recycleArchiveDelete only matches a single column, and reference_id
      //    alone isn't unique across doc types, so snapshot+delete inline here
      //    with the same compound WHERE the original query used.
      const [ledgerRows] = await conn.query<any>(
        `SELECT * FROM customer_ledger WHERE reference_type = 'credit_order_return' AND reference_id = ?`,
        [returnId],
      )
      for (const row of ledgerRows) {
        await conn.query(
          `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
           VALUES (?, 'customer_ledger', 'delete', 'id', ?, ?)`,
          [batchId, String(row.id), JSON.stringify(serializeRow(row))],
        )
      }
      await conn.query(
        `DELETE FROM customer_ledger WHERE reference_type = 'credit_order_return' AND reference_id = ?`,
        [returnId],
      )

      // 2. Restore credit_orders.total_amount and balance_due
      await recycleSnapshotBefore(conn, batchId, 'credit_orders', 'id', ret.order_id)
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = total_amount + ?,
             balance_due  = balance_due  + ?,
             updated_at   = NOW()
         WHERE id = ?`,
        [retAmount, retAmount, ret.order_id],
      )

      // 3. Restore customer running balance
      await recycleSnapshotBefore(conn, batchId, 'customers', 'id', ret.customer_id)
      await conn.query(
        `UPDATE customers
         SET current_balance = current_balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [retAmount, ret.customer_id],
      )
    }

    // ── Delete return items, then the return header ──────────────────────────
    await recycleArchiveDelete(conn, batchId, 'credit_order_return_items', 'return_id', returnId)
    await recycleArchiveDelete(conn, batchId, 'credit_order_returns', 'id', returnId)
    await recycleFinalize(conn, batchId)

    // ── Audit log ────────────────────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          'deleted',
      module:          'credit_sales',
      recordType:      'credit_order_return',
      recordId:        ret.order_id,
      referenceNumber: ret.return_number,
      description:     ret.status === 'approved'
        ? `Approved return ${ret.return_number} deleted & reversed — ৳${retAmount.toLocaleString()} restored to order ${ret.order_number}`
        : `Return ${ret.return_number} (${ret.status}) deleted from order ${ret.order_number}`,
      severity:        ret.status === 'approved' ? 'warning' : 'info',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, return_number: ret.return_number, was_approved: ret.status === 'approved' }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
