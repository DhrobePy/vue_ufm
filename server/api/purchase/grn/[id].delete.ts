import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const session  = await getUserSession(event)
  const userId   = session?.user?.id ?? 1
  const role     = ((session?.user as any)?.role ?? '').toLowerCase()
  if (role !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Only a Superadmin can cancel a GRN' })
  const body     = await readBody(event).catch(() => ({}))
  const reason   = body?.reason ?? ''

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[grn]] = await conn.query<any>(
      `SELECT id, grn_number, grn_status, purchase_order_id,
              supplier_name, quantity_received_kg, total_value
       FROM goods_received_adnan WHERE id = ?`,
      [id],
    )
    if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
    if (grn.grn_status === 'cancelled') {
      throw createError({ statusCode: 400, statusMessage: 'GRN is already cancelled' })
    }

    const reasonNote = reason ? ` Reason: ${reason}` : ''

    // Soft delete — mark cancelled
    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_status = 'cancelled',
           remarks    = CONCAT(COALESCE(remarks, ''), ' [CANCELLED${reason ? ': ' + reason : ''}]'),
           updated_at = NOW()
       WHERE id = ?`,
      [id],
    )

    await recalcPO(conn, grn.purchase_order_id)

    await auditLog(conn, {
      userId,
      action:          'grn_cancelled',
      module:          'purchase',
      recordType:      'grn',
      recordId:        id,
      referenceNumber: grn.grn_number,
      description:     `GRN ${grn.grn_number} cancelled · ${grn.supplier_name} · ${Number(grn.quantity_received_kg).toLocaleString()} KG · ৳${Number(grn.total_value).toLocaleString()}${reasonNote}`,
      severity:        'warning',
    })

    await conn.commit()
    return { ok: true, message: `GRN ${grn.grn_number} cancelled` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
