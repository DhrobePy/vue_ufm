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
              e.category_id, e.subcategory_id, e.payment_method,
              e.bank_account_id, e.cash_account_id, e.journal_entry_id,
              e.expense_date, e.remarks,
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

      // ── JOURNAL ENTRY ──────────────────────────────────────────────────
      let journalEntryId: number | null = null
      try {
        // 1. Look up expense GL account from category, then subcategory (more specific)
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

        // 2. Look up payment GL account
        let paymentAccountId: number | null = null
        if (expense.payment_method === 'cash' && expense.cash_account_id) {
          const [[ca]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [expense.cash_account_id],
          )
          paymentAccountId = ca?.chart_of_account_id ?? null
        } else if (expense.payment_method === 'bank' && expense.bank_account_id) {
          const [[ba]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [expense.bank_account_id],
          )
          paymentAccountId = ba?.chart_of_account_id ?? null
        }

        if (expenseAccountId && paymentAccountId) {
          // 3. Create journal entry
          const description = `Expense: ${expense.voucher_number} — ${expense.category_name} (${expense.remarks || ''})`.slice(0, 255)
          const [jeResult] = await conn.query<any>(
            `INSERT INTO journal_entries (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
             VALUES (?, ?, 'ExpenseVoucher', ?, ?)`,
            [expense.expense_date, description, expense.id, userId],
          )
          journalEntryId = jeResult.insertId

          // 4. Create transaction lines — DR expense / CR cash or bank
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

          // 5. If cash payment, update petty cash ledger
          if (expense.payment_method === 'cash' && expense.cash_account_id) {
            const [[pcAccount]] = await conn.query<any>(
              `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
              [expense.cash_account_id],
            )
            const currentBalance = Number(pcAccount?.current_balance ?? 0)
            const balanceAfter = currentBalance - Number(expense.total_amount)
            await conn.query(
              `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
               VALUES (?, ?, 'cash_out', ?, ?, 'expenses', ?, ?, ?, ?)`,
              [expense.cash_account_id, pcAccount?.branch_id ?? null, Number(expense.total_amount), balanceAfter, expense.id, expense.voucher_number, userId, expense.expense_date],
            )
            await conn.query(
              `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
              [Number(expense.total_amount), expense.cash_account_id],
            )
          }

          // 6. Link journal entry back to expense
          await conn.query(
            `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
            [journalEntryId, id],
          )
        } else {
          console.warn(`[approve] Skipping journal entry for expense ${expense.voucher_number}: expenseAccountId=${expenseAccountId}, paymentAccountId=${paymentAccountId}`)
        }
      } catch (jeErr) {
        console.warn(`[approve] Journal entry creation failed for expense ${expense.voucher_number}:`, jeErr)
        // Do not block the approval — journal entry is best-effort
      }

      await conn.commit()
      return { ok: true, newStatus: 'approved', journalEntryId }
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

      // ── JOURNAL REVERSAL ───────────────────────────────────────────────
      if (expense.journal_entry_id) {
        // a. Fetch original journal entry lines
        const [lines] = await conn.query<any>(
          `SELECT account_id, debit_amount, credit_amount, description FROM transaction_lines WHERE journal_entry_id = ?`,
          [expense.journal_entry_id],
        )

        // b. Create reversal journal entry
        const reversalDescription = `REVERSAL: ${expense.voucher_number} — ${reason || 'Cancelled'}`.slice(0, 255)
        const [revResult] = await conn.query<any>(
          `INSERT INTO journal_entries (transaction_date, description, related_document_type, related_document_id, reverses_entry_id, created_by_user_id)
           VALUES (CURDATE(), ?, 'ExpenseVoucher', ?, ?, ?)`,
          [reversalDescription, expense.id, expense.journal_entry_id, userId],
        )
        const reversalEntryId = revResult.insertId

        // c. Create reversed transaction lines (swap DR/CR)
        for (const line of lines as any[]) {
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, ?, ?)`,
            [reversalEntryId, line.account_id, Number(line.credit_amount), Number(line.debit_amount), line.description],
          )
        }

        // d. Mark original entry as reversed
        await conn.query(
          `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
          [reversalEntryId, expense.journal_entry_id],
        )

        // e. If cash payment, create cash_in petty cash transaction
        if (expense.payment_method === 'cash' && expense.cash_account_id) {
          const [[pcAccount]] = await conn.query<any>(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [expense.cash_account_id],
          )
          const currentBalance = Number(pcAccount?.current_balance ?? 0)
          const balanceAfter = currentBalance + Number(expense.total_amount)
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'expenses', ?, ?, ?, CURDATE())`,
            [expense.cash_account_id, pcAccount?.branch_id ?? null, Number(expense.total_amount), balanceAfter, expense.id, expense.voucher_number, userId],
          )
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [Number(expense.total_amount), expense.cash_account_id],
          )
        }
      }

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
