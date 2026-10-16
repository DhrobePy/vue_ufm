import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ACCOUNTS_ROLES, DISPATCH_ROLES, nextDocNumber, postCustomerLedger } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const role      = ((session.user as any).role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const canRecord = await userCanAction({
    userId, role, module: 'credit_sales', page: 'all', action: 'record_return',
    roleFallback: [...ACCOUNTS_ROLES, ...DISPATCH_ROLES],
  })
  if (!canRecord)
    throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to record returns' })

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

    // Legacy rule: only goods that have left can come back
    if (!['goods_on_board', 'shipped', 'delivered', 'completed'].includes(order.status))
      throw createError({ statusCode: 409, statusMessage: `Order is "${order.status}" — returns can only be recorded once the goods are on board or delivered` })

    // Price / quantity come from the ORDER, never from the browser (legacy returns.php): the client only says
    // which line and how many; each line is capped at ordered − already returned (pending or approved).
    const lines: any[] = []
    for (const sub of items) {
      const qty = Number(sub.returned_qty)
      if (!(qty > 0)) continue
      const [[li]] = await conn.query<any>(
        `SELECT coi.id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, COALESCE(p.base_name, 'item') AS product_name
         FROM credit_order_items coi LEFT JOIN products p ON p.id = coi.product_id WHERE coi.id = ? AND coi.order_id = ?`,
        [Number(sub.order_item_id), id])
      if (!li) throw createError({ statusCode: 400, statusMessage: 'A returned line does not belong to this order' })
      const [[done]] = await conn.query<any>(
        `SELECT COALESCE(SUM(ri.returned_qty), 0) q FROM credit_order_return_items ri
         JOIN credit_order_returns r ON r.id = ri.return_id WHERE ri.order_item_id = ? AND r.status <> 'rejected'`, [li.id])
      const returnable = Number(li.quantity) - Number(done.q)
      if (qty > returnable + 0.001)
        throw createError({ statusCode: 400, statusMessage: `Return qty (${qty}) for '${li.product_name}' exceeds the returnable qty (${returnable})` })
      lines.push({ order_item_id: li.id, product_id: li.product_id, variant_id: li.variant_id, original_qty: Number(li.quantity), returned_qty: qty, unit_price: Number(li.unit_price) })
    }
    if (!lines.length) throw createError({ statusCode: 400, statusMessage: 'No return quantities entered' })

    // Generate return number
    const retNo = await nextDocNumber(conn, 'RET', 'credit_order_returns', 'return_number')
    const retDate = return_date ?? new Date().toISOString().slice(0, 10)

    const totalRetQty    = lines.reduce((s: number, i: any) => s + Number(i.returned_qty), 0)
    const totalRetAmount = lines.reduce(
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
    for (const item of lines) {
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
      await postCustomerLedger(conn, {
        customerId: order.customer_id, date: retDate, transactionType: 'credit_note',
        referenceType: 'credit_order_return', referenceId: returnId, invoiceNumber: retNo,
        description: `Goods Return Credit Note — ${retNo} (Order ${order.order_number})`,
        debit: 0, credit: totalRetAmount, userId,
      })

      // Reduce order total_amount and balance_due
      await conn.query(
        `UPDATE credit_orders
         SET total_amount = GREATEST(0, total_amount - ?),
             balance_due  = GREATEST(0, balance_due  - ?),
             updated_at   = NOW()
         WHERE id = ?`,
        [totalRetAmount, totalRetAmount, id],
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
