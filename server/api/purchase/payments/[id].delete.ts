import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid payment ID' })

  const session = await getUserSession(event)
  const userName = session?.user?.name ?? session?.user?.email ?? 'System'

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[pmt]] = await conn.query<any>(
      `SELECT id, payment_voucher_number, purchase_order_id, is_posted, remarks
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
      await conn.query(`DELETE FROM purchase_payments_adnan WHERE id = ?`, [id])
    }

    await recalcPO(conn, pmt.purchase_order_id)

    await conn.commit()
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} deleted` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
