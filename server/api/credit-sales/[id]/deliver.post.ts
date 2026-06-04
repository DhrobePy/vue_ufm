import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const {
    delivery_date,
    truck_number,
    driver_name,
    driver_contact,
    is_final,
    notes,
    items,   // [{ order_item_id, product_id, variant_id, qty_delivered, unit_price }]
  } = body ?? {}

  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No delivery items provided' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Verify order exists
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date
       FROM credit_orders o WHERE o.id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Generate delivery number
    const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const delNo   = `DEL-${today}-${seq}`

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.qty_delivered), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.qty_delivered) * Number(i.unit_price), 0)
    const delivDate   = delivery_date ?? new Date().toISOString().slice(0, 10)

    // Insert delivery header
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo, id, order.customer_id,
        delivDate,
        truck_number ?? null, driver_name ?? null, driver_contact ?? null,
        totalQty, totalAmount, is_final ? 1 : 0, notes ?? null, userId,
      ],
    )
    const deliveryId = result.insertId

    // Insert delivery items
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          deliveryId,
          item.order_item_id,
          item.product_id,
          item.variant_id ?? null,
          Number(item.qty_delivered),
          Number(item.unit_price),
          Number(item.qty_delivered) * Number(item.unit_price),
        ],
      )
    }

    // ── Customer ledger entry (invoice debit on delivery) ─────
    // This is where revenue hits the ledger — on confirmed shipment/delivery
    const [[lastLedger]] = await conn.query<any>(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id],
    )
    const prevBal  = Number(lastLedger?.bal ?? 0)
    const newBal   = prevBal + totalAmount
    const shipType = is_final ? 'Full Delivery' : 'Partial Delivery'

    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'invoice', 'credit_order_delivery', ?, ?, ?, ?, 0, ?, ?)`,
      [
        order.customer_id,
        delivDate,
        deliveryId,
        delNo,
        `${shipType} — ${delNo} (Order ${order.order_number})`,
        totalAmount,
        newBal,
        userId,
      ],
    )

    // Update customer running balance
    await conn.query(
      `UPDATE customers SET current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?`,
      [totalAmount, order.customer_id],
    )

    // ── GL Journal Entry: DR Accounts Receivable / CR Sales Revenue ──────────
    // Revenue is recognised at delivery (matching principle).
    // Failure here must never block the delivery from saving.
    try {
      const [[arAccount]] = await conn.query<any>(
        `SELECT id FROM chart_of_accounts
         WHERE account_type = 'Accounts Receivable'
         ORDER BY id ASC LIMIT 1`,
      )
      const [[revenueAccount]] = await conn.query<any>(
        `SELECT id FROM chart_of_accounts
         WHERE account_type = 'Revenue'
         ORDER BY id ASC LIMIT 1`,
      )

      if (arAccount?.id && revenueAccount?.id) {
        const jeDesc = `Sales — ${delNo} (Order ${order.order_number}, ${is_final ? 'Final' : 'Partial'} Delivery)`
        const [jeRes] = await conn.query<any>(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'CreditOrderDelivery', ?, ?)`,
          [delivDate, jeDesc.slice(0, 255), deliveryId, userId],
        )
        const jeId = jeRes.insertId

        // DR Accounts Receivable (customer owes us)
        await conn.query(
          `INSERT INTO transaction_lines
             (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, arAccount.id, totalAmount, delNo],
        )
        // CR Sales Revenue (revenue recognised)
        await conn.query(
          `INSERT INTO transaction_lines
             (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, revenueAccount.id, totalAmount, delNo],
        )

        // Backlink journal_entry_id onto the customer_ledger row we just inserted
        await conn.query(
          `UPDATE customer_ledger SET journal_entry_id = ?
           WHERE reference_type = 'credit_order_delivery' AND reference_id = ?`,
          [jeId, deliveryId],
        )
      } else {
        console.warn(`[deliver] Skipping JE for ${delNo}: AR=${arAccount?.id}, Rev=${revenueAccount?.id}`)
      }
    } catch (jeErr) {
      console.warn(`[deliver] JE creation failed for ${delNo}:`, jeErr)
    }

    // Update order status + write workflow timeline entry
    const wfToStatus = is_final ? 'delivered' : order.status
    const wfAction   = is_final ? 'delivered' : 'partial_delivery'
    const wfComment  = `${is_final ? 'Final' : 'Partial'} delivery ${delNo} — ${totalQty} bags · ৳${totalAmount.toLocaleString()}${truck_number ? ` · Truck ${truck_number}` : ''}`

    if (is_final) {
      await conn.query(
        `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`, [id],
      )
    }

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, wfToStatus, wfAction, userId, wfComment],
    )

    // ── System audit log ───────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          wfAction,       // 'delivered' or 'partial_delivery' → maps to 'dispatched'
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: delNo,
      description:     `${is_final ? 'Final' : 'Partial'} delivery ${delNo} for Order ${order.order_number} — ${totalQty} bags · ৳${totalAmount.toLocaleString()}${truck_number ? ` · Truck ${truck_number}` : ''}`,
      severity:        'info',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, delivery_number: delNo, delivery_id: deliveryId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
