import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { notify, notifyAdmins } from '~/server/utils/notify'

/**
 * POST /api/expenses/:id/approve
 * body: { action: 'approve' | 'reject' | 'cancel', reason?: string }
 *
 * APPROVE — atomic: status update + journal entry + cash/bank debit all in
 *           one transaction.  If GL accounts are not configured the approval
 *           rolls back with a clear error rather than silently succeeding with
 *           no accounting entry.
 *
 * REJECT / CANCEL — status update + audit log + notify submitter.
 *
 * CANCEL (approved→cancelled) — also creates a reversal journal entry and
 *           restores petty-cash balance.
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
              e.category_id, e.subcategory_id, e.payment_method,
              e.bank_account_id, e.cash_account_id, e.journal_entry_id,
              e.expense_date, e.remarks, e.created_by_user_id,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.id = ?`,
      [id],
    )
    if (!expense) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })

    // ── APPROVE ────────────────────────────────────────────────────────────────
    if (action === 'approve') {
      if (expense.status !== 'pending')
        throw createError({ statusCode: 400, statusMessage: `Cannot approve — current status is "${expense.status}"` })

      // ── Resolve GL accounts (BEFORE changing status — fail early with clear msg) ─
      let expenseAccountId: number | null = null
      if (expense.category_id) {
        const [[cat]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`,
          [expense.category_id],
        )
        expenseAccountId = cat?.chart_of_account_id ?? null
      }
      if (expense.subcategory_id) {
        const [[sub]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM expense_subcategories WHERE id = ?`,
          [expense.subcategory_id],
        )
        if (sub?.chart_of_account_id) expenseAccountId = sub.chart_of_account_id
      }
      if (!expenseAccountId) {
        throw createError({
          statusCode: 422,
          statusMessage: `Cannot approve — expense category "${expense.category_name}" has no GL account mapped. ` +
                         `Please link a Chart of Accounts entry to this category before approving.`,
        })
      }

      let paymentAccountId: number | null = null
      if (expense.payment_method === 'cash' && expense.cash_account_id) {
        const [[ca]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [expense.cash_account_id],
        )
        paymentAccountId = ca?.chart_of_account_id ?? null
      } else if (expense.payment_method === 'bank' && expense.bank_account_id) {
        const [[ba]] = await conn.query<any>(
          `SELECT chart_of_account_id, bank_name, account_name FROM bank_accounts WHERE id = ?`,
          [expense.bank_account_id],
        )
        paymentAccountId = ba?.chart_of_account_id ?? null
      }
      if (!paymentAccountId) {
        const payLabel = expense.payment_method === 'cash'
          ? `petty-cash account #${expense.cash_account_id}`
          : `bank account #${expense.bank_account_id}`
        throw createError({
          statusCode: 422,
          statusMessage: `Cannot approve — ${payLabel} has no GL account mapped. ` +
                         `Please link a Chart of Accounts entry to the payment account before approving.`,
        })
      }

      // ── 1. Update expense status ───────────────────────────────────────────
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [userId, id],
      )

      // ── 2. Journal entry (DR Expense / CR Bank or Cash) — ATOMIC ──────────
      const jeDesc = `Expense: ${expense.voucher_number} — ${expense.category_name ?? ''}${expense.remarks ? ' · ' + expense.remarks : ''}`.slice(0, 255)
      const [jeResult] = await conn.query<any>(
        `INSERT INTO journal_entries
           (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
         VALUES (?, ?, 'ExpenseVoucher', ?, ?)`,
        [expense.expense_date, jeDesc, expense.id, userId],
      )
      const journalEntryId = jeResult.insertId

      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, 0.00, ?)`,
        [journalEntryId, expenseAccountId, Number(expense.total_amount), expense.voucher_number],
      )
      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, 0.00, ?, ?)`,
        [journalEntryId, paymentAccountId, Number(expense.total_amount), expense.voucher_number],
      )

      // ── 3. Link JE back to expense ─────────────────────────────────────────
      await conn.query(
        `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
        [journalEntryId, id],
      )

      // ── 4. Cash payment — debit petty cash balance + transaction record ────
      if (expense.payment_method === 'cash' && expense.cash_account_id) {
        const [[pcAccount]] = await conn.query<any>(
          `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [expense.cash_account_id],
        )
        const balanceAfter = Number(pcAccount?.current_balance ?? 0) - Number(expense.total_amount)
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_out', ?, ?, 'expenses', ?, ?, ?, ?)`,
          [
            expense.cash_account_id, pcAccount?.branch_id ?? null,
            Number(expense.total_amount), balanceAfter,
            expense.id, expense.voucher_number, userId, expense.expense_date,
          ],
        )
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
          [Number(expense.total_amount), expense.cash_account_id],
        )
      }

      // ── 5. Bank payment — update bank_accounts.current_balance if column exists ─
      if (expense.payment_method === 'bank' && expense.bank_account_id) {
        // current_balance is optional (may not exist on older schemas) — safe update
        await conn.query(
          `UPDATE bank_accounts
           SET current_balance = GREATEST(0, COALESCE(current_balance, 0) - ?)
           WHERE id = ?`,
          [Number(expense.total_amount), expense.bank_account_id],
        ).catch(() => {/* column may not exist — GL journal entry is the source of truth */})
      }

      // ── 6. Audit + notify submitter ────────────────────────────────────────
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

      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId:    `exp-${id}-approved`,
          userId:      expense.created_by_user_id,
          text:        `✅ Your expense ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) was approved by ${actorName}`,
          type:        'success',
          route:       `/expenses/${id}`,
          module:      'expenses',
          referenceId: id,
        })
      }

      await conn.commit()
      return { ok: true, newStatus: 'approved', journalEntryId }
    }

    // ── REJECT ─────────────────────────────────────────────────────────────────
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

      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId:    `exp-${id}-rejected`,
          userId:      expense.created_by_user_id,
          text:        `❌ Your expense ${expense.voucher_number} was rejected by ${actorName}${reason ? ` — ${reason}` : ''}`,
          type:        'error',
          route:       `/expenses/${id}`,
          module:      'expenses',
          referenceId: id,
        })
      }

      await conn.commit()
      return { ok: true, newStatus: 'rejected' }
    }

    // ── CANCEL / REVERSE ───────────────────────────────────────────────────────
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
        description:     `Expense ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) cancelled by ${actorName}${reason ? `: ${reason}` : ''}`,
        severity:        'warning',
      })

      // ── Journal reversal (only if an entry was previously posted) ──────────
      if (expense.journal_entry_id) {
        const [lines] = await conn.query<any>(
          `SELECT account_id, debit_amount, credit_amount, description
           FROM transaction_lines WHERE journal_entry_id = ?`,
          [expense.journal_entry_id],
        )
        const reversalDesc = `REVERSAL: ${expense.voucher_number} — ${reason || 'Cancelled'}`.slice(0, 255)
        const [revResult] = await conn.query<any>(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id,
              reverses_entry_id, created_by_user_id)
           VALUES (CURDATE(), ?, 'ExpenseVoucher', ?, ?, ?)`,
          [reversalDesc, expense.id, expense.journal_entry_id, userId],
        )
        const reversalEntryId = revResult.insertId

        for (const line of lines as any[]) {
          await conn.query(
            `INSERT INTO transaction_lines
               (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, ?, ?)`,
            [reversalEntryId, line.account_id, Number(line.credit_amount), Number(line.debit_amount), line.description],
          )
        }
        await conn.query(
          `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
          [reversalEntryId, expense.journal_entry_id],
        )

        // Restore petty cash balance
        if (expense.payment_method === 'cash' && expense.cash_account_id) {
          const [[pcAccount]] = await conn.query<any>(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [expense.cash_account_id],
          )
          const balanceAfter = Number(pcAccount?.current_balance ?? 0) + Number(expense.total_amount)
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'expenses', ?, ?, ?, CURDATE())`,
            [
              expense.cash_account_id, pcAccount?.branch_id ?? null,
              Number(expense.total_amount), balanceAfter,
              expense.id, `REVERSAL: ${expense.voucher_number}`, userId,
            ],
          )
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [Number(expense.total_amount), expense.cash_account_id],
          )
        }

        // Restore bank account balance
        if (expense.payment_method === 'bank' && expense.bank_account_id) {
          await conn.query(
            `UPDATE bank_accounts
             SET current_balance = COALESCE(current_balance, 0) + ?
             WHERE id = ?`,
            [Number(expense.total_amount), expense.bank_account_id],
          ).catch(() => {})
        }
      }

      // Notify submitter about cancellation
      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId:    `exp-${id}-cancelled`,
          userId:      expense.created_by_user_id,
          text:        `🚫 Your expense ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) was cancelled${reason ? ` — ${reason}` : ''}`,
          type:        'warning',
          route:       `/expenses/${id}`,
          module:      'expenses',
          referenceId: id,
        })
      }

      // Also notify admins about the cancellation (in case a non-admin self-cancels)
      await notifyAdmins({
        conn,
        stableId:    `exp-${id}-cancelled-admin`,
        text:        `🚫 Expense ${expense.voucher_number} cancelled by ${actorName}${reason ? ` — ${reason}` : ''}`,
        type:        'warning',
        route:       `/expenses/${id}`,
        module:      'expenses',
        referenceId: id,
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
