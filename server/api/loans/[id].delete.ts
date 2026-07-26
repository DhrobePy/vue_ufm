import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * DELETE /api/loans/:id — recycle-backed loan reversal. Simpler than the
 * commodity equivalents: no customer_ledger or inventory involved — just
 * archive the JE + petty-cash movement + the loan row. Blocked while any
 * repayment exists (reverse repayments first, same precedent as everywhere).
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid loan ID' })
  const body    = await readBody(event).catch(() => ({}))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Loan deletion is admin/superadmin only' })

  const reason = String(body?.reason ?? '').trim()
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[loan]] = await conn.query<any>(
      `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name
       FROM loans l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN suppliers s ON s.id = l.supplier_id
       WHERE l.id = ? FOR UPDATE`, [id],
    )
    if (!loan) throw createError({ statusCode: 404, statusMessage: 'Loan not found' })
    if (Number(loan.amount_repaid) > 0.005)
      throw createError({ statusCode: 409, statusMessage: 'This loan has repayments — reverse those first, then delete' })

    const borrowerName = loan.customer_name ?? loan.supplier_name ?? '—'
    const batchId = await recycleBegin(conn, {
      entityType: 'loan',
      label: `${loan.loan_number} — ${borrowerName} — ৳${Number(loan.principal_amount).toLocaleString()}`,
      customerId: loan.customer_id ?? null, userId, userName,
    })

    // Cash disbursement: money returns to the petty cash box
    if (loan.cash_account_id) {
      await recycleSnapshotBefore(conn, batchId, 'branch_petty_cash_accounts', 'id', loan.cash_account_id)
      const [pcTxns] = await conn.query<any>(
        `SELECT id FROM branch_petty_cash_transactions WHERE reference_type = 'loan' AND reference_id = ?`, [id],
      )
      for (const t of pcTxns) await recycleArchiveDelete(conn, batchId, 'branch_petty_cash_transactions', 'id', t.id)
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
        [Number(loan.principal_amount), loan.cash_account_id],
      )
    }

    if (loan.journal_entry_id) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', loan.journal_entry_id)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', loan.journal_entry_id)
    }
    await recycleArchiveDelete(conn, batchId, 'loans', 'id', id)
    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId, action: 'deleted', module: 'loans', recordType: 'loan',
      recordId: id, referenceNumber: loan.loan_number,
      description: `Loan ${loan.loan_number} deleted (batch #${batchId}) — ${reason}`,
      severity: 'critical',
    })
    await conn.commit()
    sendTelegram(
      `🗑️ <b>Loan Deleted</b>\n${loan.loan_number} — ${borrowerName}\n৳${Number(loan.principal_amount).toLocaleString()} · by ${userName}\nReason: ${reason}`,
      'payment')
    return { ok: true, recycle_batch_id: batchId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
