import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'
import { postPurchasePaymentJE, reversePurchasePaymentJE } from '~/server/utils/purchasePaymentGL'

/**
 * A posted payment's journal entry is never mutated in place — editing
 * reverses the old JE (mirror-image entry, original stays intact) and posts
 * a fresh one for the corrected amount/accounts, matching the reverse+repost
 * discipline already used for GRN edits and commodity-sale edits elsewhere
 * in this app.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (role !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Only a Superadmin can edit a purchase payment' })

  const {
    payment_date,
    amount_paid,
    payment_method,
    payment_type,
    bank_account_id,
    reference_number,
    handled_by_employee,
    remarks,
  } = body ?? {}

  if (!payment_date || !amount_paid)
    throw createError({ statusCode: 400, statusMessage: 'payment_date and amount_paid are required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[pmt]] = await conn.query<any>(
      `SELECT id, payment_voucher_number, purchase_order_id, journal_entry_id,
              amount_paid AS old_amount, supplier_name, is_posted
       FROM purchase_payments_adnan WHERE id = ? FOR UPDATE`,
      [id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

    // Reverse the old JE before writing the corrected row, so the reversal
    // still reflects the pre-edit account routing (bank account, type, etc.)
    let newJeId: number | null = null
    if (pmt.is_posted && pmt.journal_entry_id) {
      await reversePurchasePaymentJE(conn, {
        journalEntryId: pmt.journal_entry_id,
        pmtDate:  new Date().toISOString().slice(0, 10),
        voucherNo: pmt.payment_voucher_number,
        reason:   'payment edited',
        userId, paymentId: id,
      })
    }

    await conn.query(
      `UPDATE purchase_payments_adnan
       SET payment_date        = ?,
           amount_paid         = ?,
           payment_method      = ?,
           payment_type        = ?,
           bank_account_id     = ?,
           reference_number    = ?,
           handled_by_employee = ?,
           remarks             = ?,
           updated_at          = NOW()
       WHERE id = ?`,
      [
        payment_date,
        Number(amount_paid),
        payment_method      ?? 'cash',
        payment_type        ?? 'regular',
        bank_account_id     ?? null,
        reference_number    ?? null,
        handled_by_employee ?? null,
        remarks             ?? null,
        id,
      ],
    )

    // Re-post a fresh JE for the corrected values (same rules as creation).
    if (pmt.is_posted) {
      let bankGlAccountId: number | null = null
      let bankName: string | null = null
      if (bank_account_id) {
        const [[ba]] = await conn.query<any>(
          `SELECT bank_name, chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(bank_account_id)],
        )
        bankGlAccountId = ba?.chart_of_account_id ?? null
        bankName = ba?.bank_name ?? null
      }
      try {
        newJeId = await postPurchasePaymentJE(conn, {
          paymentId: id, pmtDate: payment_date, voucherNo: pmt.payment_voucher_number,
          paymentType: payment_type ?? 'regular', pmtAmt: Number(amount_paid),
          supplierName: pmt.supplier_name, bankName, paymentMethod: payment_method ?? 'cash',
          referenceNumber: reference_number, bankGlAccountId, userId,
        })
      } catch (jeErr: any) {
        console.warn(`[purchase/payments] Re-post JE failed for ${pmt.payment_voucher_number}:`, jeErr?.message)
      }
    }

    await recalcPO(conn, pmt.purchase_order_id)

    const amtChange = Number(amount_paid) !== Number(pmt.old_amount)
      ? ` · Amount: ৳${Number(pmt.old_amount).toLocaleString()} → ৳${Number(amount_paid).toLocaleString()}`
      : ` · ৳${Number(amount_paid).toLocaleString()}`
    await auditLog(conn, {
      userId,
      action:          'payment_updated',
      module:          'purchase',
      recordType:      'purchase_payment',
      recordId:        id,
      referenceNumber: pmt.payment_voucher_number,
      description:     `Payment ${pmt.payment_voucher_number} updated${amtChange}${newJeId ? ` · JE re-posted (#${newJeId})` : ''}`,
      severity:        amtChange.includes('→') ? 'warning' : 'info',
    })

    await conn.commit()
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} updated` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
