import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/** POST /api/bank/reconciliation/:id/toggle — mark a bank_transactions row reconciled/unreconciled. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid transaction ID' })

  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId  = Number((session?.user as any)?.id ?? 1)
  if (!['admin', 'superadmin'].includes(role) && !role.includes('account')) {
    throw createError({ statusCode: 403, statusMessage: 'Only accounts/admin can reconcile bank transactions' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    const [[txn]] = await conn.query<any>(
      `SELECT id, transaction_number, reconciled_at FROM bank_transactions WHERE id = ?`, [id],
    )
    if (!txn) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })

    const nowReconciling = !txn.reconciled_at
    await conn.query(
      `UPDATE bank_transactions
       SET reconciled_at = ?, reconciled_by_user_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [nowReconciling ? new Date() : null, nowReconciling ? userId : null, id],
    )

    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'bank',
      recordType:      'bank_transaction',
      recordId:        id,
      referenceNumber: txn.transaction_number,
      description:     `${txn.transaction_number} marked ${nowReconciling ? 'reconciled' : 'unreconciled'}`,
      severity:        'info',
    })

    return { ok: true, reconciled: nowReconciling }
  } finally {
    conn.release()
  }
})
