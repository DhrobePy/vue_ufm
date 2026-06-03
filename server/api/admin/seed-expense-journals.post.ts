import { getDb } from '~/server/utils/db'

/**
 * POST /api/admin/seed-expense-journals
 *
 * One-time backfill: creates journal_entries + transaction_lines for every
 * approved or cancelled-after-approval expense that currently has no JE.
 *
 * Safe to run multiple times — skips any expense that already has a
 * journal_entry_id OR already has a journal_entry with
 * related_document_type='ExpenseVoucher' and related_document_id=expense.id.
 *
 * Returns a detailed report of what was created / skipped / errored.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const db   = getDb()
  const conn = await db.getConnection()

  const report = {
    scanned:  0,
    created:  0,
    skipped:  0,
    errors:   [] as { id: number; voucher: string; reason: string }[],
    entries:  [] as { expenseId: number; voucher: string; jeId: number; reversalId?: number }[],
  }

  try {
    // ── 1. Fetch all approved / cancelled-after-approval expenses without a JE ──
    const [expenses] = await conn.query<any>(
      `SELECT e.id, e.voucher_number, e.status, e.total_amount,
              e.expense_date, e.remarks, e.journal_entry_id,
              e.category_id, e.subcategory_id,
              e.payment_method, e.bank_account_id, e.cash_account_id,
              e.approved_at, e.approved_by_user_id, e.updated_at,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.status IN ('approved', 'cancelled')
         AND e.approved_at IS NOT NULL
         AND e.journal_entry_id IS NULL
       ORDER BY e.expense_date ASC, e.id ASC`,
    )

    report.scanned = (expenses as any[]).length

    for (const exp of expenses as any[]) {
      try {
        await conn.beginTransaction()

        // ── Already has a JE via related_document_id? ──────────────────────
        const [[existing]] = await conn.query<any>(
          `SELECT id FROM journal_entries
           WHERE related_document_type = 'ExpenseVoucher' AND related_document_id = ?
             AND reverses_entry_id IS NULL
           LIMIT 1`,
          [exp.id],
        )
        if (existing) {
          // Just link it back
          await conn.query(
            `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
            [existing.id, exp.id],
          )
          await conn.commit()
          report.skipped++
          continue
        }

        // ── Resolve GL accounts ────────────────────────────────────────────
        let expenseAccountId: number | null = null
        if (exp.category_id) {
          const [[cat]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`,
            [exp.category_id],
          )
          expenseAccountId = cat?.chart_of_account_id ?? null
        }
        if (exp.subcategory_id) {
          const [[sub]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM expense_subcategories WHERE id = ?`,
            [exp.subcategory_id],
          )
          if (sub?.chart_of_account_id) expenseAccountId = sub.chart_of_account_id
        }

        let paymentAccountId: number | null = null
        if (exp.payment_method === 'cash' && exp.cash_account_id) {
          const [[ca]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [exp.cash_account_id],
          )
          paymentAccountId = ca?.chart_of_account_id ?? null
        } else if (exp.payment_method === 'bank' && exp.bank_account_id) {
          const [[ba]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [exp.bank_account_id],
          )
          paymentAccountId = ba?.chart_of_account_id ?? null
        }

        if (!expenseAccountId || !paymentAccountId) {
          await conn.rollback()
          report.errors.push({
            id:      exp.id,
            voucher: exp.voucher_number,
            reason:  `Missing GL account: expenseAccountId=${expenseAccountId}, paymentAccountId=${paymentAccountId}`,
          })
          continue
        }

        // ── Create forward journal entry (as of expense_date) ─────────────
        const jeDesc = `Expense: ${exp.voucher_number} — ${exp.category_name ?? ''} (${exp.remarks ?? ''})`.slice(0, 255)
        const [jeRes] = await conn.query<any>(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'ExpenseVoucher', ?, ?)`,
          [exp.expense_date, jeDesc, exp.id, exp.approved_by_user_id ?? userId],
        )
        const jeId = jeRes.insertId

        // DR expense account
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, expenseAccountId, Number(exp.total_amount), exp.voucher_number],
        )
        // CR payment account
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, paymentAccountId, Number(exp.total_amount), exp.voucher_number],
        )

        // Link to expense
        await conn.query(
          `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
          [jeId, exp.id],
        )

        const entry: (typeof report.entries)[number] = { expenseId: exp.id, voucher: exp.voucher_number, jeId }

        // ── If cancelled-after-approval: also create reversal entry ────────
        if (exp.status === 'cancelled') {
          const revDesc = `REVERSAL: ${exp.voucher_number} — Cancelled`.slice(0, 255)
          // Use updated_at as the reversal date (closest to when it was cancelled)
          const revDate = exp.updated_at
            ? new Date(exp.updated_at).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)

          const [revRes] = await conn.query<any>(
            `INSERT INTO journal_entries
               (transaction_date, description, related_document_type, related_document_id,
                reverses_entry_id, created_by_user_id)
             VALUES (?, ?, 'ExpenseVoucher', ?, ?, ?)`,
            [revDate, revDesc, exp.id, jeId, userId],
          )
          const revId = revRes.insertId

          // Reversed lines (swap DR/CR)
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, 0.00, ?, ?)`,
            [revId, expenseAccountId, Number(exp.total_amount), exp.voucher_number],
          )
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, 0.00, ?)`,
            [revId, paymentAccountId, Number(exp.total_amount), exp.voucher_number],
          )

          // Mark forward entry as reversed
          await conn.query(
            `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
            [revId, jeId],
          )

          entry.reversalId = revId
        }

        await conn.commit()
        report.created++
        report.entries.push(entry)

      } catch (rowErr: any) {
        await conn.rollback()
        report.errors.push({
          id:      exp.id,
          voucher: exp.voucher_number,
          reason:  rowErr?.message ?? String(rowErr),
        })
      }
    }

    return {
      ok: true,
      report,
      summary: `Scanned ${report.scanned} expenses → ${report.created} JEs created, ${report.skipped} already linked, ${report.errors.length} errors`,
    }
  } finally {
    conn.release()
  }
})
