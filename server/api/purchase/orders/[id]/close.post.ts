import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const body    = await readBody(event)
  const action  = (body?.action ?? 'close') as 'close' | 'reopen'
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, delivery_status FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    if (action === 'reopen') {
      if (po.delivery_status !== 'closed') {
        throw createError({ statusCode: 400, statusMessage: 'PO is not closed — cannot reopen' })
      }
      await conn.query(
        `UPDATE purchase_orders_adnan SET delivery_status = 'partial', updated_at = NOW() WHERE id = ?`,
        [id],
      )
      await auditLog(conn, {
        userId,
        action:          'po_reopened',
        module:          'purchase',
        recordType:      'purchase_order',
        recordId:        id,
        referenceNumber: po.po_number,
        description:     `PO ${po.po_number} reopened — goods receipt is allowed again`,
        severity:        'warning',
      })
      await conn.commit()
      return { ok: true, message: `PO ${po.po_number} reopened — goods receipt is allowed again` }
    }

    // Default: close
    if (po.delivery_status === 'closed') {
      throw createError({ statusCode: 400, statusMessage: 'PO is already closed' })
    }
    await conn.query(
      `UPDATE purchase_orders_adnan SET delivery_status = 'closed', updated_at = NOW() WHERE id = ?`,
      [id],
    )
    await auditLog(conn, {
      userId,
      action:          'po_closed',
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        id,
      referenceNumber: po.po_number,
      description:     `PO ${po.po_number} closed — no further goods can be received`,
      severity:        'info',
    })
    await conn.commit()
    return { ok: true, message: `PO ${po.po_number} closed — no further goods can be received` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
