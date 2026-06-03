import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/expenses/:id/approve
 * body: { action: 'approve' | 'reject' | 'cancel', reason?: string }
 */
export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { action, reason } = body ?? {}
  const session   = await getUserSession(event)
  const userId    = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  if (!id || !action)
    throw createError({ statusCode: 400, statusMessage: 'id and action required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[expense]] = await conn.query<any>(
      `SELECT e.id, e.voucher_number, e.status, e.total_amount,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.id = ?`,
      [id],
    )
    if (!expense) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })

    // ── APPROVE ────────────────────────────────────────────────────────────
    if (action === 'approve') {
      if (expense.status !== 'pending')
        throw createError({ statusCode: 400, statusMessage: `Cannot approve — current status is "${expense.status}"` })

      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [userId, id],
      )
      await auditLog(conn, {
        userId,
        action:          'approved',
        module:          'expenses',
        recordType:      'expense_voucher',
        recordId:        id,
        referenceNumber: expense.voucher_number,
        description:     `Expense ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) approved by ${actorName}`,
        severity:        'info',
      })
      await conn.commit()
      return { ok: true, newStatus: 'approved' }
    }

    // ── REJECT ─────────────────────────────────────────────────────────────
    if (action === 'reject') {
      if (expense.status !== 'pending')
        throw createError({ statusCode: 400, statusMessage: `Cannot reject — current status is "${expense.status}"` })

      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'rejected', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [userId, reason ?? null, id],
      )
      await auditLog(conn, {
        userId,
        action:          'rejected',
        module:          'expenses',
        recordType:      'expense_voucher',
        recordId:        id,
        referenceNumber: expense.voucher_number,
        description:     `Expense ${expense.voucher_number} rejected by ${actorName}${reason ? `: ${reason}` : ''}`,
        severity:        'warning',
      })
      await conn.commit()
      return { ok: true, newStatus: 'rejected' }
    }

    // ── CANCEL / REVERSE ───────────────────────────────────────────────────
    if (action === 'cancel') {
      if (!['approved', 'pending'].includes(expense.status))
        throw createError({ statusCode: 400, statusMessage: `Cannot cancel — current status is "${expense.status}"` })

      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'cancelled', rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [reason ?? null, id],
      )
      await auditLog(conn, {
        userId,
        action:          'cancelled',
        module:          'expenses',
        recordType:      'expense_voucher',
        recordId:        id,
        referenceNumber: expense.voucher_number,
        description:     `Expense ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) cancelled/reversed by ${actorName}${reason ? `: ${reason}` : ''}`,
        severity:        'warning',
      })
      await conn.commit()
      return { ok: true, newStatus: 'cancelled' }
    }

    throw createError({ statusCode: 400, statusMessage: `Unknown action "${action}"` })
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
