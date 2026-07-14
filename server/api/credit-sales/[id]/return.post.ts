import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const {
    return_date,
    return_type   = 'partial',
    return_reason,
    notes,
    items,   // [{ order_item_id, product_id, variant_id, original_qty, returned_qty, unit_price }]
  } = body ?? {}

  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No return items provided' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, order_number, balance_due, amount_paid, total_amount, status
       FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Generate return number
    const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_order_returns WHERE DATE(created_at) = CURDATE()`,
    )
    const seq   = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const retNo = `RET-${today}-${seq}`
    const retDate = return_date ?? new Date().toISOString().slice(0, 10)

    const totalRetQty    = items.reduce((s: number, i: any) => s + Number(i.returned_qty), 0)
    const totalRetAmount = items.reduce(
      (s: number, i: any) => s + Number(i.returned_qty) * Number(i.unit_price), 0,
    )

    // Maker/checker separation (spec §2.9): always lands pending, even for
    // admins — a DIFFERENT authorised user must approve via the decide
    // endpoint (which already blocks self-approval). No auto-approve shortcut.
    const autoApprove = false
    const retStatus   = 'pending'

    // Insert return header
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_returns
         (return_number, order_id, customer_id, return_date, return_type,
          return_reason, total_returned_amount, total_returned_qty,
          status, approved_by_user_id, approved_at, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        retNo, id, order.customer_id, retDate,
        return_type, return_reason ?? null,
        totalRetAmount, totalRetQty,
        retStatus,
        autoApprove ? userId : null,
        autoApprove ? new Date() : null,
        notes ?? null, userId,
      ],
    )
    const returnId = result.insertId

    // Insert return items
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_return_items
           (return_id, order_item_id, product_id, variant_id,
            original_qty, returned_qty, unit_price, returned_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          returnId,
          item.order_item_id,
          item.product_id,
          item.variant_id ?? null,
          Number(item.original_qty ?? 0),
          Number(item.returned_qty),
          Number(item.unit_price),
          Number(item.returned_qty) * Number(item.unit_price),
        ],
      )
    }

    if (autoApprove) {
      // ── Ledger: credit note reduces the customer's balance ───
      const [[lastLedger]] = await conn.query<any>(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [order.customer_id],
      )
      const prevBal = Number(lastLedger?.bal ?? 0)
      const newBal  = Math.max(0, prevBal - totalRetAmount)

      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'credit_note', 'credit_order_return', ?, ?, ?, 0, ?, ?, ?)`,
        [
          order.customer_id, retDate, returnId, retNo,
          `Goods Return Credit Note — ${retNo} (Order ${order.order_number})`,
          totalRetAmount, newBal, userId,
        ],
      )

      // Reduce order total_amount and balance_due
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, id],
      )

      // Reduce customer running balance
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?),
             updated_at = NOW()
         WHERE id = ?`,
        [totalRetAmount, order.customer_id],
      )
    }

    // ── Workflow timeline entry ────────────────────────────
    const wfAction  = autoApprove ? 'return_approved' : 'return_submitted'
    const wfComment = `Return ${retNo} — ${totalRetQty} bags · ৳${totalRetAmount.toLocaleString()} (${return_reason ?? 'no reason'})${autoApprove ? ' · Auto-approved' : ' · Pending approval'}`
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status ?? 'delivered', order.status ?? 'delivered', wfAction, userId, wfComment],
    )

    // ── System audit log ───────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          wfAction,       // 'return_submitted'→'other', 'return_approved'→'approved'
      module:          'credit_sales',
      recordType:      'credit_order_return',
      recordId:        id,        // store the CREDIT ORDER id so audit page can link to /credit-sales/{id}
      referenceNumber: retNo,
      description:     `Return ${retNo} for Order ${order.order_number} — ${totalRetQty} bags · ৳${totalRetAmount.toLocaleString()} · ${autoApprove ? 'auto-approved' : 'pending approval'}`,
      severity:        autoApprove ? 'info' : 'warning',
      ipAddress,
    })

    await conn.commit()
    return {
      ok: true,
      return_number: retNo,
      return_id:     returnId,
      status:        retStatus,
      amount:        totalRetAmount,
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
