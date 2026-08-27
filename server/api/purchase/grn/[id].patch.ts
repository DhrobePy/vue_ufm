import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'
import { postGRNJournalEntry, reverseGRNJournalEntry } from '~/server/utils/grnGL'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()
  if (role !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Only a Superadmin can edit a GRN' })

  const {
    grn_date,
    truck_number,
    quantity_received_kg,
    expected_quantity,
    unload_point_name,
    unload_point_branch_id,
    variance_remarks,
    remarks,
  } = body ?? {}

  if (!grn_date) throw createError({ statusCode: 400, statusMessage: 'grn_date is required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[grn]] = await conn.query<any>(
      `SELECT id, grn_number, grn_status, purchase_order_id, unit_price_per_kg, journal_entry_id,
              quantity_received_kg AS old_qty
       FROM goods_received_adnan WHERE id = ? FOR UPDATE`,
      [id],
    )
    if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
    if (grn.grn_status === 'cancelled') {
      throw createError({ statusCode: 400, statusMessage: 'Cannot edit a cancelled GRN' })
    }

    const newQtyKg    = Number(quantity_received_kg ?? grn.old_qty)
    const expectedKg  = Number(expected_quantity) || 0
    const unitPrice   = Number(grn.unit_price_per_kg)
    // Payment is based on EXPECTED (billed) quantity, not actual weighed quantity.
    const billedQty   = expectedKg > 0 ? expectedKg : newQtyKg
    const totalValue  = billedQty * unitPrice

    // Variance vs expected_quantity (if provided)
    const varPct = expectedKg > 0
      ? (((newQtyKg - expectedKg) / expectedKg) * 100).toFixed(4)
      : '0'

    // Reverse the old GL entry before writing the corrected row — legacy's
    // own changelog documents fixing exactly this bug once already
    // ("leaving inventory value permanently desynced from the GL").
    // Never mutate the original entry, post a mirror-image reversal instead.
    if (grn.journal_entry_id) {
      await reverseGRNJournalEntry(conn, {
        journalEntryId: grn.journal_entry_id, grnNumber: grn.grn_number,
        reason: 'GRN edited', userId, grnId: id,
      })
    }

    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_date               = ?,
           truck_number           = ?,
           quantity_received_kg   = ?,
           expected_quantity      = ?,
           total_value            = ?,
           variance_percentage    = ?,
           unload_point_name      = ?,
           unload_point_branch_id = ?,
           variance_remarks       = ?,
           remarks                = ?,
           updated_at             = NOW()
       WHERE id = ?`,
      [
        grn_date,
        truck_number ?? null,
        newQtyKg,
        expectedKg > 0 ? expectedKg : null,
        totalValue,
        varPct,
        unload_point_name ?? null,
        unload_point_branch_id ?? null,
        variance_remarks ?? null,
        remarks ?? null,
        id,
      ],
    )

    // Re-post a fresh GL entry for the corrected value.
    let newJeId: number | null = null
    try {
      const [[po]] = await conn.query<any>(`SELECT po_number FROM purchase_orders_adnan WHERE id = ?`, [grn.purchase_order_id])
      newJeId = await postGRNJournalEntry(conn, {
        grnId: id, poId: grn.purchase_order_id, grnNumber: grn.grn_number,
        poNumber: po?.po_number ?? '', grnDate: grn_date, totalValue, userId,
      })
    } catch (jeErr) {
      console.warn(`[grn] Re-post GL failed for ${grn.grn_number}:`, jeErr)
    }

    await recalcPO(conn, grn.purchase_order_id)

    const changeNote = newQtyKg !== Number(grn.old_qty)
      ? ` · Qty changed: ${Number(grn.old_qty).toLocaleString()} → ${newQtyKg.toLocaleString()} KG`
      : ''
    await auditLog(conn, {
      userId,
      action:          'grn_updated',
      module:          'purchase',
      recordType:      'grn',
      recordId:        id,
      referenceNumber: grn.grn_number,
      description:     `GRN ${grn.grn_number} updated${changeNote} · Total Value: ৳${totalValue.toLocaleString()}${newJeId ? ` · GL re-posted (#${newJeId})` : ''}`,
      severity:        newQtyKg !== Number(grn.old_qty) ? 'warning' : 'info',
    })

    await conn.commit()
    return { ok: true, message: `GRN ${grn.grn_number} updated` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
