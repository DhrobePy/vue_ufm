import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * DELETE /api/customers/:id
 * Cascade-archives the customer's ENTIRE footprint (spec §2.11, §4.2):
 * every order (with its own full cascade — items, workflow, deliveries,
 * returns, over-deliveries, conditions, amendments, QR confirmations/scans,
 * ledger + GL), every payment + allocation, every pending request, then the
 * customer row itself. Everything restorable from /admin/recycle-bin.
 *
 * Blocked (not cascaded) if the customer has a nonzero ledger balance —
 * deletes that would orphan money are refused, matching the same rule
 * purchase-side already applies to a commodity with open POs.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })

  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId  = Number((session?.user as any)?.id ?? 1)
  const userName = (session?.user as any)?.name ?? `User ${userId}`
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can delete customers' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[customer]] = await conn.query<any>(
      `SELECT id, name, business_name FROM customers WHERE id = ? FOR UPDATE`, [id],
    )
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    // Ledger truth, never the cached column — ledger truth (spec §2.2)
    const [[bal]] = await conn.query<any>(
      `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS balance
       FROM customer_ledger WHERE customer_id = ?`,
      [id],
    )
    if (Math.abs(Number(bal.balance)) > 0.5) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot delete — outstanding ledger balance of ৳${Number(bal.balance).toLocaleString()}. Settle or write off first.`,
      })
    }

    const label = customer.business_name ? `${customer.name} (${customer.business_name})` : customer.name
    const batchId = await recycleBegin(conn, {
      entityType: 'customer', label, customerId: id, userId, userName,
    })

    const [orders] = await conn.query<any[]>(`SELECT id FROM credit_orders WHERE customer_id = ?`, [id])

    // ── Payments + allocations first — they reference orders we're about to
    //    delete, so must go before the per-order loop ─────────────────────
    const [payments] = await conn.query<any[]>(`SELECT id FROM customer_payments WHERE customer_id = ?`, [id])
    for (const p of payments as any[]) {
      await recycleArchiveDelete(conn, batchId, 'payment_allocations', 'payment_id', p.id)
    }
    await recycleArchiveDelete(conn, batchId, 'customer_payments', 'customer_id', id)

    // ── Every order's full footprint ──────────────────────────────────────
    for (const o of orders as any[]) {
      const orderId = o.id

      const [deliveries] = await conn.query<any[]>(
        `SELECT id FROM credit_order_deliveries WHERE order_id = ?`, [orderId],
      )
      for (const d of deliveries as any[]) {
        await recycleArchiveDelete(conn, batchId, 'credit_order_delivery_items', 'delivery_id', d.id)
      }
      await recycleArchiveDelete(conn, batchId, 'credit_order_deliveries', 'order_id', orderId)

      const [returns] = await conn.query<any[]>(
        `SELECT id FROM credit_order_returns WHERE order_id = ?`, [orderId],
      )
      for (const r of returns as any[]) {
        await recycleArchiveDelete(conn, batchId, 'credit_order_return_items', 'return_id', r.id)
      }
      await recycleArchiveDelete(conn, batchId, 'credit_order_returns', 'order_id', orderId)

      const [overDeliveries] = await conn.query<any[]>(
        `SELECT id FROM credit_order_over_deliveries WHERE order_id = ?`, [orderId],
      )
      for (const od of overDeliveries as any[]) {
        await recycleArchiveDelete(conn, batchId, 'credit_order_over_delivery_items', 'od_id', od.id)
      }
      await recycleArchiveDelete(conn, batchId, 'credit_order_over_deliveries', 'order_id', orderId)

      await recycleArchiveDelete(conn, batchId, 'order_approval_conditions', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'order_amendments', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'cr_qr_scan_log', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'cr_delivery_confirmations', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'credit_pending_requests', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'credit_order_workflow', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'credit_order_audit', 'order_id', orderId)

      // Ledger rows for this order (+ its deliveries) and their GL journal entries
      const deliveryIds = (deliveries as any[]).map(d => d.id)
      const deliveryRefSql = deliveryIds.length
        ? ` OR (reference_type = 'credit_order_delivery' AND reference_id IN (${deliveryIds.map(() => '?').join(',')}))`
        : ''
      const [ledgerRows] = await conn.query<any[]>(
        `SELECT id, journal_entry_id FROM customer_ledger
         WHERE (reference_type = 'credit_order' AND reference_id = ?)${deliveryRefSql}`,
        [orderId, ...deliveryIds],
      )
      for (const row of ledgerRows as any[]) {
        await recycleArchiveDelete(conn, batchId, 'customer_ledger', 'id', row.id)
      }
      for (const jeId of (ledgerRows as any[]).map(r => r.journal_entry_id).filter(Boolean)) {
        await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', jeId)
        await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', jeId)
      }

      await recycleArchiveDelete(conn, batchId, 'credit_order_items', 'order_id', orderId)
      await recycleArchiveDelete(conn, batchId, 'credit_orders', 'id', orderId)
    }

    // ── Any remaining customer-level rows not tied to a specific order
    //    (opening balance / manual adjustments, customer-level pending
    //    requests like collect_payment) ──────────────────────────────────
    const [remainingLedger] = await conn.query<any[]>(
      `SELECT id, journal_entry_id FROM customer_ledger WHERE customer_id = ?`, [id],
    )
    for (const row of remainingLedger as any[]) {
      await recycleArchiveDelete(conn, batchId, 'customer_ledger', 'id', row.id)
    }
    for (const jeId of (remainingLedger as any[]).map(r => r.journal_entry_id).filter(Boolean)) {
      await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', jeId)
      await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', jeId)
    }
    await recycleArchiveDelete(conn, batchId, 'credit_pending_requests', 'customer_id', id)

    // ── The customer itself — last, so restore re-inserts it first ────────
    await recycleArchiveDelete(conn, batchId, 'customers', 'id', id)

    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId,
      action:          'deleted',
      module:          'customers',
      recordType:      'customer',
      recordId:        id,
      referenceNumber: customer.name,
      description:     `Customer "${label}" deleted (${(orders as any[]).length} order(s) cascaded) — recoverable from Recycle Bin`,
      severity:        'critical',
    })

    await conn.commit()
    return { ok: true, deleted: label, recycle_bin_batch_id: batchId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
