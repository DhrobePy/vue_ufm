import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'
import { postCommodityGRNCost } from '~/server/utils/commodityTrading'
import { nextDocNumber } from '~/server/utils/creditOrders'
import { nextNoteNumber } from '~/server/utils/purchaseNotes'
import { postGRNJournalEntry } from '~/server/utils/grnGL'
import { sendTelegram } from '~/server/utils/telegram'

export default defineEventHandler(async (event) => {
  const body   = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    po_id,
    grn_date,
    truck_number,
    quantity_received_kg,
    expected_quantity,
    unload_point_name,
    unload_point_branch_id,   // which branch received the goods — feeds commodity costing
    remarks,
    over_delivery_action, // 'as_is' | 'accept_with_dan'
    excess_qty,
  } = body ?? {}

  if (!po_id || !grn_date || !quantity_received_kg) {
    throw createError({ statusCode: 400, statusMessage: 'po_id, grn_date and quantity_received_kg are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Fetch PO
    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, supplier_name, supplier_id, unit_price_per_kg, quantity_kg,
              commodity_id, wheat_origin, is_delivery_locked, delivery_lock_reason, quantity_kg AS po_qty
       FROM purchase_orders_adnan WHERE id = ?`,
      [Number(po_id)],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })
    // Legacy rule: an admin-locked PO takes no further GRNs until it is re-opened
    if (Number(po.is_delivery_locked) === 1)
      throw createError({ statusCode: 409, statusMessage: `This purchase order (PO #${po.po_number}) has been locked by admin — no further GRNs can be recorded.${po.delivery_lock_reason ? ' Reason: ' + po.delivery_lock_reason : ''} Contact a Superadmin or Admin to re-open it.` })

    const receivedKg  = Number(quantity_received_kg)
    const expectedKg  = Number(expected_quantity) || 0
    const unitPrice   = Number(po.unit_price_per_kg)
    // Payment is based on EXPECTED (billed) quantity, not actual weighed quantity.
    // If no expected_quantity is provided, fall back to actual received.
    const billedQty   = expectedKg > 0 ? expectedKg : receivedKg
    const totalValue  = billedQty * unitPrice

    // Variance vs expected_quantity (if provided) else vs PO ordered qty
    const baseQty     = expectedKg > 0 ? expectedKg : Number(po.quantity_kg)
    const varPct      = baseQty > 0 ? (((receivedKg - baseQty) / baseQty) * 100).toFixed(4) : '0'

    // Generate GRN number: GRN-YYYYMMDD-NNNN
    const grnNo = await nextDocNumber(conn, 'GRN', 'goods_received_adnan', 'grn_number')

    const [result] = await conn.query<any>(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, expected_quantity,
          unit_price_per_kg, total_value,
          variance_percentage,
          truck_number, unload_point_name, unload_point_branch_id, remarks,
          grn_status, receiver_user_id,
          created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, ?,
               ?,
               ?, ?, ?, ?,
               'verified', ?,
               NOW(), NOW())`,
      [
        grnNo, grn_date, Number(po_id), po.po_number,
        po.supplier_id ?? null, po.supplier_name,
        receivedKg, expectedKg > 0 ? expectedKg : null,
        unitPrice, totalValue,
        varPct,
        truck_number ?? null, unload_point_name ?? null,
        unload_point_branch_id ? Number(unload_point_branch_id) : null,
        remarks ?? null,
        userId,
      ],
    )
    const grnId = result.insertId

    // Recalculate PO totals
    await recalcPO(conn, Number(po_id))

    // ── Commodity costing — raise trading stock at blended average cost ──
    // Best-effort follow-up (mirrors legacy): fires only when the PO is
    // commodity-tagged AND a receiving branch was chosen; a failure must
    // never block the GRN itself.
    if (po.commodity_id && unload_point_branch_id) {
      try {
        await postCommodityGRNCost(conn, {
          commodityId: Number(po.commodity_id),
          branchId: Number(unload_point_branch_id),
          origin: po.wheat_origin ?? '',
          qty: receivedKg,
          unitCost: unitPrice,
        })
      } catch (costErr) {
        console.warn(`[grn] commodity costing failed for ${grnNo}:`, costErr)
      }
    }

    // ── GL — capitalize the received goods as inventory ───────────────────
    // Best-effort, same rule as the costing call above: never blocks the GRN.
    try {
      await postGRNJournalEntry(conn, {
        grnId, poId: Number(po_id), grnNumber: grnNo, poNumber: po.po_number,
        grnDate: grn_date, totalValue, userId,
      })
    } catch (jeErr) {
      console.warn(`[grn] GL posting failed for ${grnNo}:`, jeErr)
    }

    // Audit log
    const varianceNote = expectedKg > 0
      ? ` · Expected: ${expectedKg.toLocaleString()} KG · Variance: ${Number(varPct) >= 0 ? '+' : ''}${Number(varPct).toFixed(2)}%`
      : ''
    await auditLog(conn, {
      userId,
      action:          'grn_created',
      module:          'purchase',
      recordType:      'grn',
      recordId:        grnId,
      referenceNumber: grnNo,
      description:     `GRN ${grnNo} recorded: ${po.supplier_name} · PO ${po.po_number} · Received ${receivedKg.toLocaleString()} KG · Billed ${billedQty.toLocaleString()} KG · ৳${totalValue.toLocaleString()}${varianceNote}`,
      severity:        Math.abs(Number(varPct)) > 1 ? 'warning' : 'info',
    })

    // Auto-create draft Debit Adjustment Note if over-delivery
    if (over_delivery_action === 'accept_with_dan' && Number(excess_qty) > 0) {
      try {
        const excessKg = Number(excess_qty)
        const danAmt   = excessKg * unitPrice

        // Check if purchase_adjustment_notes table exists
        const [[adjCheck]] = await conn.query<any>(
          `SELECT COUNT(*) AS n FROM information_schema.tables
           WHERE table_schema = DATABASE() AND table_name = 'purchase_adjustment_notes'`,
        )
        if (adjCheck.n > 0) {
          const danNo = await nextNoteNumber(conn, 'debit')

          const [danResult] = await conn.query<any>(
            `INSERT INTO purchase_adjustment_notes
               (note_number, note_type, reason_type, purchase_order_id,
                quantity_kg, unit_price_per_kg, amount,
                description, status, created_at, updated_at)
             VALUES (?, 'debit', 'over_delivery', ?,
                     ?, ?, ?,
                     ?, 'draft', NOW(), NOW())`,
            [
              danNo, Number(po_id),
              excessKg, unitPrice, danAmt,
              `Auto-generated: Over-delivery on ${grnNo}. Excess qty: ${excessKg.toFixed(2)} KG.`,
            ],
          )
          await auditLog(conn, {
            userId,
            action:          'adj_created',
            module:          'purchase',
            recordType:      'adjustment_note',
            recordId:        danResult.insertId,
            referenceNumber: danNo,
            description:     `Auto-draft DAN ${danNo} created for over-delivery on GRN ${grnNo} · Excess ${excessKg.toFixed(2)} KG · ৳${danAmt.toLocaleString()}`,
            severity:        'warning',
          })
        }
      } catch (danErr) {
        console.error('Auto-DAN creation error:', danErr)
      }
    }

    const [[tot]] = await conn.query<any>(`SELECT total_received_qty FROM purchase_orders_adnan WHERE id = ?`, [Number(po_id)])
    await conn.commit()
    const poQty = Number(po.po_qty) || 0, got = Number(tot?.total_received_qty) || 0
    sendTelegram(
      `📦 <b>Goods Received</b>\n${grnNo} — ${po.supplier_name} (PO ${po.po_number})\n${receivedKg.toLocaleString()} KG${truck_number ? ' · truck ' + truck_number : ''} @ ৳${unitPrice.toLocaleString()} = ৳${totalValue.toLocaleString()}\nPO progress: ${got.toLocaleString()} / ${poQty.toLocaleString()} KG${poQty > 0 ? ` (${((got / poQty) * 100).toFixed(1)}%)` : ''}`, 'goods_received')
    return { ok: true, id: grnId, grn_number: grnNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
