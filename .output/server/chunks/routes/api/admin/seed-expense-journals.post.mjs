import { m as defineEventHandler, K as getUserSession, u as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const seedExpenseJournals_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const db = getDb();
  const conn = await db.getConnection();
  const report = {
    scanned: 0,
    created: 0,
    skipped: 0,
    errors: [],
    entries: []
  };
  try {
    const [expenses] = await conn.query(
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
       ORDER BY e.expense_date ASC, e.id ASC`
    );
    report.scanned = expenses.length;
    for (const exp of expenses) {
      try {
        await conn.beginTransaction();
        const [[existing]] = await conn.query(
          `SELECT id FROM journal_entries
           WHERE related_document_type = 'ExpenseVoucher' AND related_document_id = ?
             AND reverses_entry_id IS NULL
           LIMIT 1`,
          [exp.id]
        );
        if (existing) {
          await conn.query(
            `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
            [existing.id, exp.id]
          );
          await conn.commit();
          report.skipped++;
          continue;
        }
        let expenseAccountId = null;
        if (exp.category_id) {
          const [[cat]] = await conn.query(
            `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`,
            [exp.category_id]
          );
          expenseAccountId = (_c = cat == null ? void 0 : cat.chart_of_account_id) != null ? _c : null;
        }
        if (exp.subcategory_id) {
          const [[sub]] = await conn.query(
            `SELECT chart_of_account_id FROM expense_subcategories WHERE id = ?`,
            [exp.subcategory_id]
          );
          if (sub == null ? void 0 : sub.chart_of_account_id) expenseAccountId = sub.chart_of_account_id;
        }
        let paymentAccountId = null;
        if (exp.payment_method === "cash" && exp.cash_account_id) {
          const [[ca]] = await conn.query(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [exp.cash_account_id]
          );
          paymentAccountId = (_d = ca == null ? void 0 : ca.chart_of_account_id) != null ? _d : null;
        } else if (exp.payment_method === "bank" && exp.bank_account_id) {
          const [[ba]] = await conn.query(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [exp.bank_account_id]
          );
          paymentAccountId = (_e = ba == null ? void 0 : ba.chart_of_account_id) != null ? _e : null;
        }
        if (!expenseAccountId || !paymentAccountId) {
          await conn.rollback();
          report.errors.push({
            id: exp.id,
            voucher: exp.voucher_number,
            reason: `Missing GL account: expenseAccountId=${expenseAccountId}, paymentAccountId=${paymentAccountId}`
          });
          continue;
        }
        const jeDesc = `Expense: ${exp.voucher_number} \u2014 ${(_f = exp.category_name) != null ? _f : ""} (${(_g = exp.remarks) != null ? _g : ""})`.slice(0, 255);
        const [jeRes] = await conn.query(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'ExpenseVoucher', ?, ?)`,
          [exp.expense_date, jeDesc, exp.id, (_h = exp.approved_by_user_id) != null ? _h : userId]
        );
        const jeId = jeRes.insertId;
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, expenseAccountId, Number(exp.total_amount), exp.voucher_number]
        );
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, paymentAccountId, Number(exp.total_amount), exp.voucher_number]
        );
        await conn.query(
          `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
          [jeId, exp.id]
        );
        const entry = { expenseId: exp.id, voucher: exp.voucher_number, jeId };
        if (exp.status === "cancelled") {
          const revDesc = `REVERSAL: ${exp.voucher_number} \u2014 Cancelled`.slice(0, 255);
          const revDate = exp.updated_at ? new Date(exp.updated_at).toISOString().slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const [revRes] = await conn.query(
            `INSERT INTO journal_entries
               (transaction_date, description, related_document_type, related_document_id,
                reverses_entry_id, created_by_user_id)
             VALUES (?, ?, 'ExpenseVoucher', ?, ?, ?)`,
            [revDate, revDesc, exp.id, jeId, userId]
          );
          const revId = revRes.insertId;
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, 0.00, ?, ?)`,
            [revId, expenseAccountId, Number(exp.total_amount), exp.voucher_number]
          );
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, 0.00, ?)`,
            [revId, paymentAccountId, Number(exp.total_amount), exp.voucher_number]
          );
          await conn.query(
            `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
            [revId, jeId]
          );
          entry.reversalId = revId;
        }
        await conn.commit();
        report.created++;
        report.entries.push(entry);
      } catch (rowErr) {
        await conn.rollback();
        report.errors.push({
          id: exp.id,
          voucher: exp.voucher_number,
          reason: (_i = rowErr == null ? void 0 : rowErr.message) != null ? _i : String(rowErr)
        });
      }
    }
    return {
      ok: true,
      report,
      summary: `Scanned ${report.scanned} expenses \u2192 ${report.created} JEs created, ${report.skipped} already linked, ${report.errors.length} errors`
    };
  } finally {
    conn.release();
  }
});

export { seedExpenseJournals_post as default };
//# sourceMappingURL=seed-expense-journals.post.mjs.map
