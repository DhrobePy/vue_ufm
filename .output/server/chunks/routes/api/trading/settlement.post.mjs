import { q as defineEventHandler, as as readBody, X as getUserSession, m as createError, aR as userCanAction, b as ADMIN_ROLES, A as ACCOUNTS_ROLES, z as getDb, a6 as nextDocNumber, E as getGLAccountId, al as postJournalEntry, ai as postCustomerLedger, g as auditLog, aK as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const settlement_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  const canSettle = await userCanAction({
    userId,
    role,
    module: "trading",
    page: "settlement",
    action: "settle",
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES]
  });
  if (!canSettle) throw createError({ statusCode: 403, statusMessage: "Your account is not allowed to post settlements" });
  const partnerId = Number(body == null ? void 0 : body.partner_id);
  const amount = Number((_c = body == null ? void 0 : body.amount) != null ? _c : 0);
  if (!partnerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: "partner_id and a positive amount are required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[partner]] = await conn.query(
      `SELECT bp.id, bp.name, c.id AS customer_id, c.name AS customer_name,
              s.id AS supplier_id, s.company_name AS supplier_name
       FROM business_partners bp
       LEFT JOIN customers c ON c.business_partner_id = bp.id
       LEFT JOIN suppliers s ON s.business_partner_id = bp.id
       WHERE bp.id = ? FOR UPDATE`,
      [partnerId]
    );
    if (!partner) throw createError({ statusCode: 404, statusMessage: "Partner not found" });
    if (!partner.customer_id || !partner.supplier_id)
      throw createError({ statusCode: 409, statusMessage: "Partner must have BOTH a linked customer and supplier to settle" });
    const [[cl]] = await conn.query(
      `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS bal
       FROM customer_ledger WHERE customer_id = ?`,
      [partner.customer_id]
    );
    const receivable = Number((_d = cl == null ? void 0 : cl.bal) != null ? _d : 0);
    const [[sup]] = await conn.query(
      `SELECT COALESCE(current_balance, 0) AS bal FROM suppliers WHERE id = ?`,
      [partner.supplier_id]
    );
    const payable = Number((_e = sup == null ? void 0 : sup.bal) != null ? _e : 0);
    if (amount > receivable + 5e-3)
      throw createError({ statusCode: 400, statusMessage: `\u09F3${amount.toLocaleString()} exceeds the receivable of \u09F3${receivable.toLocaleString()}` });
    if (amount > payable + 5e-3)
      throw createError({ statusCode: 400, statusMessage: `\u09F3${amount.toLocaleString()} exceeds the payable of \u09F3${payable.toLocaleString()}` });
    const setNo = await nextDocNumber(conn, "SET", "business_partner_settlements", "settlement_number");
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    const apId = await getGLAccountId(conn, "Accounts Payable");
    let jeId = null;
    if (arId && apId) {
      jeId = await postJournalEntry(conn, {
        date: today,
        description: `Partner settlement \u2014 ${setNo} (${partner.name}): AP netted against AR`,
        docType: "PartnerSettlement",
        docId: 0,
        userId,
        lines: [
          { accountId: apId, debit: amount, credit: 0, memo: setNo },
          { accountId: arId, debit: 0, credit: amount, memo: setNo }
        ]
      });
    }
    const ledgerId = await postCustomerLedger(conn, {
      customerId: partner.customer_id,
      date: today,
      transactionType: "adjustment",
      referenceType: "partner_settlement",
      referenceId: partnerId,
      invoiceNumber: setNo,
      description: `Settlement ${setNo} \u2014 netted against supplier balance of ${partner.supplier_name}`,
      debit: 0,
      credit: amount,
      journalEntryId: jeId,
      userId
    });
    let supplierLedgerId = null;
    try {
      const [slRes] = await conn.query(
        `INSERT INTO supplier_ledger
           (supplier_id, transaction_date, transaction_type, reference_number, description, debit_amount, credit_amount, balance)
         VALUES (?, ?, 'adjustment', ?, ?, ?, 0, ?)`,
        [
          partner.supplier_id,
          today,
          setNo,
          `Settlement ${setNo} \u2014 netted against receivable of ${partner.customer_name}`,
          amount,
          payable - amount
        ]
      );
      supplierLedgerId = slRes.insertId;
    } catch (e) {
      console.warn("[settlement] supplier_ledger insert failed:", e);
    }
    await conn.query(
      `UPDATE suppliers SET current_balance = GREATEST(0, current_balance - ?) WHERE id = ?`,
      [amount, partner.supplier_id]
    );
    const [setRes] = await conn.query(
      `INSERT INTO business_partner_settlements
         (settlement_number, partner_id, customer_id, supplier_id, amount, settlement_date,
          journal_entry_id, customer_ledger_id, supplier_ledger_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        setNo,
        partnerId,
        partner.customer_id,
        partner.supplier_id,
        amount,
        today,
        jeId,
        ledgerId,
        supplierLedgerId,
        (_f = body == null ? void 0 : body.notes) != null ? _f : null,
        userId
      ]
    );
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [setRes.insertId, jeId]);
    await auditLog(conn, {
      userId,
      action: "created",
      module: "trading",
      recordType: "partner_settlement",
      recordId: setRes.insertId,
      referenceNumber: setNo,
      description: `Settlement ${setNo} \u2014 ${partner.name}: \u09F3${amount.toLocaleString()} AP\u2194AR netted`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F500} <b>Partner Settlement</b>
${setNo} \u2014 ${partner.name}
\u09F3${amount.toLocaleString()} netted (AR\u2194AP) \xB7 by ${userName}`,
      "payment_received"
    );
    return { ok: true, settlement_number: setNo, id: setRes.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { settlement_post as default };
//# sourceMappingURL=settlement.post.mjs.map
