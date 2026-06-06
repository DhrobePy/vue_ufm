import { h as defineEventHandler, v as getRouterParam, L as readBody, w as getUserSession, e as createError, n as getDb, a as auditLog, D as notify, E as notifyAdmins } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const approve_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action, reason } = body != null ? body : {};
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  if (!id || !action)
    throw createError({ statusCode: 400, statusMessage: "id and action required" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[expense]] = await conn.query(
      `SELECT e.id, e.voucher_number, e.status, e.total_amount,
              e.category_id, e.subcategory_id, e.payment_method,
              e.bank_account_id, e.cash_account_id, e.journal_entry_id,
              e.expense_date, e.remarks, e.created_by_user_id,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.id = ?`,
      [id]
    );
    if (!expense) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
    if (action === "approve") {
      if (expense.status !== "pending")
        throw createError({ statusCode: 400, statusMessage: `Cannot approve \u2014 current status is "${expense.status}"` });
      let expenseAccountId = null;
      if (expense.category_id) {
        const [[cat]] = await conn.query(
          `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`,
          [expense.category_id]
        );
        expenseAccountId = (_g = cat == null ? void 0 : cat.chart_of_account_id) != null ? _g : null;
      }
      if (expense.subcategory_id) {
        const [[sub]] = await conn.query(
          `SELECT chart_of_account_id FROM expense_subcategories WHERE id = ?`,
          [expense.subcategory_id]
        );
        if (sub == null ? void 0 : sub.chart_of_account_id) expenseAccountId = sub.chart_of_account_id;
      }
      if (!expenseAccountId) {
        throw createError({
          statusCode: 422,
          statusMessage: `Cannot approve \u2014 expense category "${expense.category_name}" has no GL account mapped. Please link a Chart of Accounts entry to this category before approving.`
        });
      }
      let paymentAccountId = null;
      if (expense.payment_method === "cash" && expense.cash_account_id) {
        const [[ca]] = await conn.query(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [expense.cash_account_id]
        );
        paymentAccountId = (_h = ca == null ? void 0 : ca.chart_of_account_id) != null ? _h : null;
      } else if (expense.payment_method === "bank" && expense.bank_account_id) {
        const [[ba]] = await conn.query(
          `SELECT chart_of_account_id, bank_name, account_name FROM bank_accounts WHERE id = ?`,
          [expense.bank_account_id]
        );
        paymentAccountId = (_i = ba == null ? void 0 : ba.chart_of_account_id) != null ? _i : null;
      }
      if (!paymentAccountId) {
        const payLabel = expense.payment_method === "cash" ? `petty-cash account #${expense.cash_account_id}` : `bank account #${expense.bank_account_id}`;
        throw createError({
          statusCode: 422,
          statusMessage: `Cannot approve \u2014 ${payLabel} has no GL account mapped. Please link a Chart of Accounts entry to the payment account before approving.`
        });
      }
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [userId, id]
      );
      const jeDesc = `Expense: ${expense.voucher_number} \u2014 ${(_j = expense.category_name) != null ? _j : ""}${expense.remarks ? " \xB7 " + expense.remarks : ""}`.slice(0, 255);
      const [jeResult] = await conn.query(
        `INSERT INTO journal_entries
           (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
         VALUES (?, ?, 'ExpenseVoucher', ?, ?)`,
        [expense.expense_date, jeDesc, expense.id, userId]
      );
      const journalEntryId = jeResult.insertId;
      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, 0.00, ?)`,
        [journalEntryId, expenseAccountId, Number(expense.total_amount), expense.voucher_number]
      );
      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, 0.00, ?, ?)`,
        [journalEntryId, paymentAccountId, Number(expense.total_amount), expense.voucher_number]
      );
      await conn.query(
        `UPDATE expense_vouchers SET journal_entry_id = ? WHERE id = ?`,
        [journalEntryId, id]
      );
      if (expense.payment_method === "cash" && expense.cash_account_id) {
        const [[pcAccount]] = await conn.query(
          `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [expense.cash_account_id]
        );
        const balanceAfter = Number((_k = pcAccount == null ? void 0 : pcAccount.current_balance) != null ? _k : 0) - Number(expense.total_amount);
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_out', ?, ?, 'expenses', ?, ?, ?, ?)`,
          [
            expense.cash_account_id,
            (_l = pcAccount == null ? void 0 : pcAccount.branch_id) != null ? _l : null,
            Number(expense.total_amount),
            balanceAfter,
            expense.id,
            expense.voucher_number,
            userId,
            expense.expense_date
          ]
        );
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
          [Number(expense.total_amount), expense.cash_account_id]
        );
      }
      if (expense.payment_method === "bank" && expense.bank_account_id) {
        await conn.query(
          `UPDATE bank_accounts
           SET current_balance = GREATEST(0, COALESCE(current_balance, 0) - ?)
           WHERE id = ?`,
          [Number(expense.total_amount), expense.bank_account_id]
        ).catch(() => {
        });
      }
      await auditLog(conn, {
        userId,
        action: "approved",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) approved by ${actorName}`,
        severity: "info"
      });
      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId: `exp-${id}-approved`,
          userId: expense.created_by_user_id,
          text: `\u2705 Your expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) was approved by ${actorName}`,
          type: "success",
          route: `/expenses/${id}`,
          module: "expenses",
          referenceId: id
        });
      }
      await conn.commit();
      return { ok: true, newStatus: "approved", journalEntryId };
    }
    if (action === "reject") {
      if (expense.status !== "pending")
        throw createError({ statusCode: 400, statusMessage: `Cannot reject \u2014 current status is "${expense.status}"` });
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'rejected', approved_by_user_id = ?, approved_at = NOW(),
             rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [userId, reason != null ? reason : null, id]
      );
      await auditLog(conn, {
        userId,
        action: "rejected",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} rejected by ${actorName}${reason ? `: ${reason}` : ""}`,
        severity: "warning"
      });
      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId: `exp-${id}-rejected`,
          userId: expense.created_by_user_id,
          text: `\u274C Your expense ${expense.voucher_number} was rejected by ${actorName}${reason ? ` \u2014 ${reason}` : ""}`,
          type: "error",
          route: `/expenses/${id}`,
          module: "expenses",
          referenceId: id
        });
      }
      await conn.commit();
      return { ok: true, newStatus: "rejected" };
    }
    if (action === "cancel") {
      if (!["approved", "pending"].includes(expense.status))
        throw createError({ statusCode: 400, statusMessage: `Cannot cancel \u2014 current status is "${expense.status}"` });
      await conn.query(
        `UPDATE expense_vouchers
         SET status = 'cancelled', rejection_reason = ?, updated_at = NOW()
         WHERE id = ?`,
        [reason != null ? reason : null, id]
      );
      await auditLog(conn, {
        userId,
        action: "cancelled",
        module: "expenses",
        recordType: "expense_voucher",
        recordId: id,
        referenceNumber: expense.voucher_number,
        description: `Expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) cancelled by ${actorName}${reason ? `: ${reason}` : ""}`,
        severity: "warning"
      });
      if (expense.journal_entry_id) {
        const [lines] = await conn.query(
          `SELECT account_id, debit_amount, credit_amount, description
           FROM transaction_lines WHERE journal_entry_id = ?`,
          [expense.journal_entry_id]
        );
        const reversalDesc = `REVERSAL: ${expense.voucher_number} \u2014 ${reason || "Cancelled"}`.slice(0, 255);
        const [revResult] = await conn.query(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id,
              reverses_entry_id, created_by_user_id)
           VALUES (CURDATE(), ?, 'ExpenseVoucher', ?, ?, ?)`,
          [reversalDesc, expense.id, expense.journal_entry_id, userId]
        );
        const reversalEntryId = revResult.insertId;
        for (const line of lines) {
          await conn.query(
            `INSERT INTO transaction_lines
               (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, ?, ?)`,
            [reversalEntryId, line.account_id, Number(line.credit_amount), Number(line.debit_amount), line.description]
          );
        }
        await conn.query(
          `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
          [reversalEntryId, expense.journal_entry_id]
        );
        if (expense.payment_method === "cash" && expense.cash_account_id) {
          const [[pcAccount]] = await conn.query(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [expense.cash_account_id]
          );
          const balanceAfter = Number((_m = pcAccount == null ? void 0 : pcAccount.current_balance) != null ? _m : 0) + Number(expense.total_amount);
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'expenses', ?, ?, ?, CURDATE())`,
            [
              expense.cash_account_id,
              (_n = pcAccount == null ? void 0 : pcAccount.branch_id) != null ? _n : null,
              Number(expense.total_amount),
              balanceAfter,
              expense.id,
              `REVERSAL: ${expense.voucher_number}`,
              userId
            ]
          );
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [Number(expense.total_amount), expense.cash_account_id]
          );
        }
        if (expense.payment_method === "bank" && expense.bank_account_id) {
          await conn.query(
            `UPDATE bank_accounts
             SET current_balance = COALESCE(current_balance, 0) + ?
             WHERE id = ?`,
            [Number(expense.total_amount), expense.bank_account_id]
          ).catch(() => {
          });
        }
      }
      if (expense.created_by_user_id) {
        await notify({
          conn,
          stableId: `exp-${id}-cancelled`,
          userId: expense.created_by_user_id,
          text: `\u{1F6AB} Your expense ${expense.voucher_number} (\u09F3${Number(expense.total_amount).toLocaleString()}) was cancelled${reason ? ` \u2014 ${reason}` : ""}`,
          type: "warning",
          route: `/expenses/${id}`,
          module: "expenses",
          referenceId: id
        });
      }
      await notifyAdmins({
        conn,
        stableId: `exp-${id}-cancelled-admin`,
        text: `\u{1F6AB} Expense ${expense.voucher_number} cancelled by ${actorName}${reason ? ` \u2014 ${reason}` : ""}`,
        type: "warning",
        route: `/expenses/${id}`,
        module: "expenses",
        referenceId: id
      });
      await conn.commit();
      return { ok: true, newStatus: "cancelled" };
    }
    throw createError({ statusCode: 400, statusMessage: `Unknown action "${action}"` });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { approve_post as default };
//# sourceMappingURL=approve.post.mjs.map
