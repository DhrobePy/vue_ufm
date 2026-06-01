import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

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
      `SELECT id, payment_voucher_number, purchase_order_id,
              amount_paid AS old_amount, supplier_name
       FROM purchase_payments_adnan WHERE id = ?`,
      [id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

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
      description:     `Payment ${pmt.payment_voucher_number} updated${amtChange}`,
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
