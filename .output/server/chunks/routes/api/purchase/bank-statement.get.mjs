import { V as defineEventHandler, aj as getQuery, b8 as query, J as createError } from '../../../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PURCHASE_TYPES = ["purchase_payment_adnan", "PurchasePayment", "PurchasePaymentReversal", "payment_adnan_edit_reversal"];
const TYPE_LABEL = {
  purchase_payment_adnan: "Purchase payment",
  PurchasePayment: "Purchase payment",
  PurchasePaymentReversal: "Payment reversal",
  payment_adnan_edit_reversal: "Payment edit reversal",
  InternalTransfer: "Internal transfer",
  BankAccount: "Opening balance",
  GeneralTransaction: "General",
  credit_orders: "Sales receipt",
  customer_payments: "Customer receipt",
  debit_vouchers: "Debit voucher",
  debit_voucher: "Debit voucher",
  ExpenseVoucher: "Expense",
  BankTransaction: "Bank transaction"
};
const bankStatement_get = defineEventHandler(async (event) => {
  var _a, _b;
  const q = getQuery(event);
  const uuid = String((_a = q.uuid) != null ? _a : "");
  if (!uuid) {
    const accounts = await query(
      `SELECT ba.uuid, ba.bank_name, ba.account_name, ba.account_number, ba.account_type,
              (SELECT COUNT(*) FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id
               WHERE tl.account_id = ba.chart_of_account_id AND je.related_document_type IN (?)) AS purchase_payments,
              (SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount),0) FROM transaction_lines tl WHERE tl.account_id = ba.chart_of_account_id) AS balance
       FROM bank_accounts ba WHERE ba.chart_of_account_id IS NOT NULL ORDER BY purchase_payments DESC, ba.bank_name, ba.account_name`,
      [PURCHASE_TYPES]
    );
    return { accounts: accounts.map((a) => ({ ...a, purchase_payments: Number(a.purchase_payments), balance: Number(a.balance) })) };
  }
  const [acct] = await query(
    `SELECT ba.id, ba.uuid, ba.bank_name, ba.branch_name, ba.account_name, ba.account_number, coa.id AS coa_id, coa.name AS coa_name, coa.normal_balance
     FROM bank_accounts ba JOIN chart_of_accounts coa ON coa.id = ba.chart_of_account_id WHERE ba.uuid = ? LIMIT 1`,
    [uuid]
  );
  if (!acct) throw createError({ statusCode: 404, statusMessage: "Bank account not found" });
  const ok = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v != null ? v : ""));
  const from = ok(q.from) ? String(q.from) : null, to = ok(q.to) ? String(q.to) : null;
  const type = ["purchase", "transfer"].includes(String(q.type)) ? String(q.type) : "all";
  const debitNormal = String((_b = acct.normal_balance) != null ? _b : "").toLowerCase() === "debit";
  const sign = (dr, cr) => debitNormal ? dr - cr : cr - dr;
  let opening = 0;
  if (from) {
    const [o] = await query(`SELECT COALESCE(SUM(tl.debit_amount),0) dr, COALESCE(SUM(tl.credit_amount),0) cr FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id WHERE tl.account_id = ? AND je.transaction_date < ?`, [acct.coa_id, from]);
    opening = sign(Number(o.dr), Number(o.cr));
  }
  const where = ["tl.account_id = ?"], params = [acct.coa_id];
  if (from) {
    where.push("je.transaction_date >= ?");
    params.push(from);
  }
  if (to) {
    where.push("je.transaction_date <= ?");
    params.push(to);
  }
  if (type === "purchase") {
    where.push("je.related_document_type IN (?)");
    params.push(PURCHASE_TYPES);
  }
  if (type === "transfer") where.push(`je.related_document_type = 'InternalTransfer'`);
  const rows = await query(
    `SELECT je.id AS je_id, je.transaction_date AS date, je.description, je.related_document_type AS doc_type, tl.debit_amount AS debit, tl.credit_amount AS credit,
            ppa.payment_voucher_number AS voucher, ppa.po_number AS po, ppa.supplier_name AS supplier, ppa.reference_number AS reference, ppa.payment_method AS method
     FROM transaction_lines tl JOIN journal_entries je ON je.id = tl.journal_entry_id
     LEFT JOIN purchase_payments_adnan ppa ON ppa.id = je.related_document_id AND je.related_document_type IN (?)
     WHERE ${where.join(" AND ")} ORDER BY je.transaction_date, je.id`,
    [PURCHASE_TYPES, ...params]
  );
  let run = opening, td = 0, tc = 0;
  const lines = rows.map((r) => {
    var _a2, _b2, _c, _d, _e, _f, _g;
    const dr = Number(r.debit), cr = Number(r.credit);
    td += dr;
    tc += cr;
    run += sign(dr, cr);
    return { date: String(r.date).slice(0, 10), type: (_b2 = (_a2 = TYPE_LABEL[r.doc_type]) != null ? _a2 : r.doc_type) != null ? _b2 : "", description: r.description, voucher: (_c = r.voucher) != null ? _c : "", po: (_d = r.po) != null ? _d : "", supplier: (_e = r.supplier) != null ? _e : "", reference: (_f = r.reference) != null ? _f : "", method: (_g = r.method) != null ? _g : "", debit: dr, credit: cr, balance: Math.round(run * 100) / 100 };
  });
  return {
    account: { uuid: acct.uuid, bank_name: acct.bank_name, branch_name: acct.branch_name, account_name: acct.account_name, account_number: acct.account_number, ledger_account: acct.coa_name },
    from,
    to,
    type,
    opening: Math.round(opening * 100) / 100,
    totals: { debit: td, credit: tc, closing: Math.round(run * 100) / 100 },
    lines
  };
});

export { bankStatement_get as default };
//# sourceMappingURL=bank-statement.get.mjs.map
