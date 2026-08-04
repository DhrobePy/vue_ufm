import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })

  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const userName  = session?.user?.name ?? session?.user?.email ?? 'System'
  const role      = ((session?.user as any)?.role ?? '').toLowerCase()
  if (role !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Only a Superadmin can delete a purchase payment' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[pmt]] = await conn.query<any>(
      `SELECT id, payment_voucher_number, purchase_order_id, is_posted,
              amount_paid, supplier_name, remarks
       FROM purchase_payments_adnan WHERE id = ?`,
      [id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

    if (pmt.is_posted) {
      // Soft delete — clear is_posted flag, append deletion note to remarks
      const now     = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const newNote = `\n[DELETED: ${userName} @ ${now}]`
      await conn.query(
        `UPDATE purchase_payments_adnan
         SET is_posted  = 0,
             remarks    = CONCAT(COALESCE(remarks, ''), ?),
             updated_at = NOW()
         WHERE id = ?`,
        [newNote, id],
      )
    } else {
      // Hard delete — unposted payment
      const batchId = await recycleBegin(conn, {
        entityType: 'purchase_payment', label: pmt.payment_voucher_number, userId, userName,
      })
      await recycleArchiveDelete(conn, batchId, 'purchase_payments_adnan', 'id', id)
      await recycleFinalize(conn, batchId)
    }

    await recalcPO(conn, pmt.purchase_order_id)

    const typeNote = pmt.is_posted ? ' (was posted — soft deleted)' : ' (hard deleted)'
    await auditLog(conn, {
      userId,
      action:          'payment_deleted',
      module:          'purchase',
      recordType:      'purchase_payment',
      recordId:        id,
      referenceNumber: pmt.payment_voucher_number,
      description:     `Payment ${pmt.payment_voucher_number} deleted by ${userName} · ৳${Number(pmt.amount_paid).toLocaleString()} to ${pmt.supplier_name}${typeNote}`,
      severity:        'warning',
    })

    await conn.commit()
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} deleted` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
