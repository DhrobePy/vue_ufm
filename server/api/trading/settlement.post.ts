import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, ACCOUNTS_ROLES, getGLAccountId, postJournalEntry,
  postCustomerLedger, nextDocNumber,
} from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

/**
 * POST /api/trading/settlement — net a linked partner's receivable (what
 * they owe us as a customer) against their payable (what we owe them as a
 * supplier): one JE DR Accounts Payable / CR Accounts Receivable, one
 * customer_ledger CREDIT, one supplier_ledger DEBIT. No cash moves.
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const canSettle = await userCanAction({
    userId, role, module: 'trading', page: 'settlement', action: 'settle',
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES],
  })
  if (!canSettle) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to post settlements' })

  const partnerId = Number(body?.partner_id)
  const amount    = Number(body?.amount ?? 0)
  if (!partnerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: 'partner_id and a positive amount are required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[partner]] = await conn.query<any>(
      `SELECT bp.id, bp.name, c.id AS customer_id, c.name AS customer_name,
              s.id AS supplier_id, s.company_name AS supplier_name
       FROM business_partners bp
       LEFT JOIN customers c ON c.business_partner_id = bp.id
       LEFT JOIN suppliers s ON s.business_partner_id = bp.id
       WHERE bp.id = ? FOR UPDATE`, [partnerId],
    )
    if (!partner) throw createError({ statusCode: 404, statusMessage: 'Partner not found' })
    if (!partner.customer_id || !partner.supplier_id)
      throw createError({ statusCode: 409, statusMessage: 'Partner must have BOTH a linked customer and supplier to settle' })

    // Both sides must actually carry at least this much balance
    const [[cl]] = await conn.query<any>(
      `SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS bal
       FROM customer_ledger WHERE customer_id = ?`, [partner.customer_id],
    )
    const receivable = Number(cl?.bal ?? 0)
    const [[sup]] = await conn.query<any>(
      `SELECT COALESCE(current_balance, 0) AS bal FROM suppliers WHERE id = ?`, [partner.supplier_id],
    )
    const payable = Number(sup?.bal ?? 0)
    if (amount > receivable + 0.005)
      throw createError({ statusCode: 400, statusMessage: `৳${amount.toLocaleString()} exceeds the receivable of ৳${receivable.toLocaleString()}` })
    if (amount > payable + 0.005)
      throw createError({ statusCode: 400, statusMessage: `৳${amount.toLocaleString()} exceeds the payable of ৳${payable.toLocaleString()}` })

    const setNo = await nextDocNumber(conn, 'SET', 'business_partner_settlements', 'settlement_number')
    const today = new Date().toISOString().slice(0, 10)

    const arId = await getGLAccountId(conn, 'Accounts Receivable')
    const apId = await getGLAccountId(conn, 'Accounts Payable')
    let jeId: number | null = null
    if (arId && apId) {
      jeId = await postJournalEntry(conn, {
        date: today, description: `Partner settlement — ${setNo} (${partner.name}): AP netted against AR`,
        docType: 'PartnerSettlement', docId: 0, userId,
        lines: [
          { accountId: apId, debit: amount, credit: 0, memo: setNo },
          { accountId: arId, debit: 0, credit: amount, memo: setNo },
        ],
      })
    }

    const ledgerId = await postCustomerLedger(conn, {
      customerId: partner.customer_id, date: today, transactionType: 'adjustment',
      referenceType: 'partner_settlement', referenceId: partnerId, invoiceNumber: setNo,
      description: `Settlement ${setNo} — netted against supplier balance of ${partner.supplier_name}`,
      debit: 0, credit: amount, journalEntryId: jeId, userId,
    })

    // Supplier side: DEBIT reduces what we owe them
    let supplierLedgerId: number | null = null
    try {
      const [slRes] = await conn.query<any>(
        `INSERT INTO supplier_ledger
           (supplier_id, transaction_date, transaction_type, reference_number, description, debit_amount, credit_amount, balance)
         VALUES (?, ?, 'adjustment', ?, ?, ?, 0, ?)`,
        [partner.supplier_id, today, setNo,
         `Settlement ${setNo} — netted against receivable of ${partner.customer_name}`,
         amount, payable - amount],
      )
      supplierLedgerId = slRes.insertId
    } catch (e) { console.warn('[settlement] supplier_ledger insert failed:', e) }
    await conn.query(
      `UPDATE suppliers SET current_balance = GREATEST(0, current_balance - ?) WHERE id = ?`,
      [amount, partner.supplier_id],
    )

    const [setRes] = await conn.query<any>(
      `INSERT INTO business_partner_settlements
         (settlement_number, partner_id, customer_id, supplier_id, amount, settlement_date,
          journal_entry_id, customer_ledger_id, supplier_ledger_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [setNo, partnerId, partner.customer_id, partner.supplier_id, amount, today,
       jeId, ledgerId, supplierLedgerId, body?.notes ?? null, userId],
    )
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [setRes.insertId, jeId])

    await auditLog(conn, {
      userId, action: 'created', module: 'trading', recordType: 'partner_settlement',
      recordId: setRes.insertId, referenceNumber: setNo,
      description: `Settlement ${setNo} — ${partner.name}: ৳${amount.toLocaleString()} AP↔AR netted`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `🔀 <b>Partner Settlement</b>\n${setNo} — ${partner.name}\n৳${amount.toLocaleString()} netted (AR↔AP) · by ${userName}`,
      'payment_received')
    return { ok: true, settlement_number: setNo, id: setRes.insertId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
