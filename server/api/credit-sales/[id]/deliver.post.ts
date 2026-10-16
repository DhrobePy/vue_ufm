import { getDb } from '~/server/utils/db'
import { getAppSettings } from '~/server/utils/appSettings'
import { auditLog } from '~/server/utils/audit'
import { getUserActionLimit, nextDocNumber, isAdminRole, generateDeliverySlipNumber, transitionOrder, postCustomerLedger, postJournalEntry, getGLAccountId } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const role      = ((session.user as any).role ?? '').toLowerCase()
  const canDeliver = ['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra',
    'dispatch-srg', 'dispatch-demra', 'dispatchpos-srg', 'dispatchpos-demra'].includes(role)
  if (!canDeliver)
    throw createError({ statusCode: 403, statusMessage: 'Your role cannot record deliveries' })
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

    // Verify order exists and is actually goods-on-board (locked against races)
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date
       FROM credit_orders o WHERE o.id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (!['goods_on_board', 'shipped', 'delivered'].includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" — mark goods on board first (deliveries only after that)`,
      })

    // Generate delivery number
    const delNo = await nextDocNumber(conn, 'DEL', 'credit_order_deliveries', 'delivery_number')

    // Price comes from the ORDER and each line is capped at ordered − already delivered (legacy partial_delivery.php).
    // Delivering MORE than was ordered is the separate Over-Delivery flow, not a delivery.
    const lines: any[] = []
    for (const sub of items) {
      const qty = Number(sub.qty_delivered)
      if (!(qty > 0)) continue
      const [[li]] = await conn.query<any>(
        `SELECT coi.id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, COALESCE(p.base_name, 'item') AS product_name
         FROM credit_order_items coi LEFT JOIN products p ON p.id = coi.product_id WHERE coi.id = ? AND coi.order_id = ?`,
        [Number(sub.order_item_id), id])
      if (!li) throw createError({ statusCode: 400, statusMessage: 'A delivered line does not belong to this order' })
      const [[done]] = await conn.query<any>(`SELECT COALESCE(SUM(qty_delivered), 0) q FROM credit_order_delivery_items WHERE order_item_id = ?`, [li.id])
      const remaining = Number(li.quantity) - Number(done.q)
      if (qty > remaining + 0.001)
        throw createError({ statusCode: 400, statusMessage: `Delivery qty (${qty}) for '${li.product_name}' exceeds the remaining qty (${remaining}) — use Over-Delivery for extra bags` })
      lines.push({ order_item_id: li.id, product_id: li.product_id, variant_id: li.variant_id, qty_delivered: qty, unit_price: Number(li.unit_price) })
    }
    if (!lines.length) throw createError({ statusCode: 400, statusMessage: 'No delivery quantities entered' })
    items.splice(0, items.length, ...lines)   // everything below now works on the verified lines

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.qty_delivered), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.qty_delivered) * Number(i.unit_price), 0)
    const delivDate   = delivery_date ?? new Date().toISOString().slice(0, 10)

    // Per-action partial_delivery ৳ cap (admin exempt). Only enforced when a
    // cap is explicitly configured — this action has no legacy-column fallback.
    if (!['admin', 'superadmin'].includes(role)) {
      const deliveryCap = await getUserActionLimit(conn, userId, 'partial_delivery')
      if (deliveryCap !== null && totalAmount > deliveryCap) {
        throw createError({
          statusCode: 403,
          statusMessage: `Delivery value ৳${totalAmount.toLocaleString()} exceeds your partial-delivery limit of ৳${deliveryCap.toLocaleString()} — ask a user with higher authority to record it`,
        })
      }
    }

    // Slip number: the order's first truck reuses the one issued at Goods on Board;
    // every further truck gets the next number in the branch's monthly series.
    const [[ordBranch]] = await conn.query<any>(`SELECT assigned_branch_id FROM credit_orders WHERE id = ?`, [id])
    const [[prevDel]] = await conn.query<any>(`SELECT COUNT(*) n FROM credit_order_deliveries WHERE order_id = ?`, [id])
    const [[ship]] = await conn.query<any>(`SELECT delivery_slip_number FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id])
    const slipNo = (Number(prevDel.n) === 0 && ship?.delivery_slip_number)
      ? ship.delivery_slip_number
      : await generateDeliverySlipNumber(conn, ordBranch?.assigned_branch_id ?? null, delivDate)
    const bags = Math.max(0, Math.floor(Number(body?.bags_boarded ?? 0))) || null
    const bagKg = Math.max(0, Number(body?.bag_size_kg ?? 0)) || null

    // Insert delivery header
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id,
          delivery_slip_number, bags_boarded, bag_size_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo, id, order.customer_id,
        delivDate,
        truck_number ?? null, driver_name ?? null, driver_contact ?? null,
        totalQty, totalAmount, is_final ? 1 : 0, notes ?? null, userId,
        slipNo, bags, bagKg,
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

    // ── Dispatcher extra discount on this truck (legacy partial_delivery rule) ───────────
    // The invoice already posted at Goods on Board, so the discount is a CREDIT NOTE:
    // ledger credit + Dr Revenue / Cr Receivable, and the order total/balance drop with it.
    const extraDisc = Math.round(Number(body?.extra_discount_amount ?? 0) * 100) / 100
    const extraReason = String(body?.extra_discount_reason ?? '').trim()
    let discountNote = ''
    if (extraDisc < 0) throw createError({ statusCode: 400, statusMessage: 'Discount amount cannot be negative' })
    if (extraDisc > 0) {
      if (!extraReason) throw createError({ statusCode: 400, statusMessage: 'Please enter a reason for the additional discount' })
      if (extraDisc > totalAmount)
        throw createError({ statusCode: 400, statusMessage: `Discount (৳${extraDisc.toLocaleString()}) cannot exceed this delivery's amount (৳${totalAmount.toLocaleString()})` })
      const [[ord]] = await conn.query<any>(`SELECT order_number, customer_id FROM credit_orders WHERE id = ?`, [id])
      const [[cust]] = await conn.query<any>(`SELECT name FROM customers WHERE id = ?`, [ord.customer_id])
      const arId = await getGLAccountId(conn, 'Accounts Receivable')
      const revId = await getGLAccountId(conn, 'Revenue')
      let jeId: number | null = null
      if (arId && revId)
        jeId = await postJournalEntry(conn, {
          date: delivDate, description: `Delivery discount — ${delNo} (${ord.order_number}, ${cust?.name ?? ''}): ${extraReason}`,
          docType: 'CreditOrderDiscount', docId: deliveryId, userId,
          lines: [
            { accountId: revId, debit: extraDisc, credit: 0, memo: delNo },
            { accountId: arId, debit: 0, credit: extraDisc, memo: delNo },
          ],
        })
      await postCustomerLedger(conn, {
        customerId: ord.customer_id, date: delivDate, transactionType: 'credit_note',
        referenceType: 'credit_order_delivery', referenceId: deliveryId, invoiceNumber: delNo,
        description: `Delivery discount — ${delNo} (Order ${ord.order_number}): ${extraReason}`.slice(0, 250),
        debit: 0, credit: extraDisc, journalEntryId: jeId, userId,
      })
      await conn.query(
        `UPDATE credit_orders
         SET discount_amount = discount_amount + ?, total_amount = GREATEST(0, total_amount - ?),
             balance_due = GREATEST(0, balance_due - ?), updated_at = NOW() WHERE id = ?`,
        [extraDisc, extraDisc, extraDisc, id])
      await conn.query(
        `UPDATE credit_order_deliveries SET extra_discount_amount = ?, extra_discount_reason = ?,
           extra_discount_by_user_id = ?, extra_discount_at = NOW() WHERE id = ?`,
        [extraDisc, extraReason, userId, deliveryId])
      discountNote = ` · discount ৳${extraDisc.toLocaleString()} (${extraReason})`
    }

    // NOTE: NO ledger / JE here. The invoice (full order value) posts to
    // Settings → Orders → "Allow partial deliveries" OFF: this delivery must carry everything still owed on every line.
    if ((await getAppSettings()).order_policy.allow_partial === false) {
      const [allLines] = await conn.query<any>(
        `SELECT oi.id, oi.quantity, COALESCE((SELECT SUM(di.qty_delivered) FROM credit_order_delivery_items di WHERE di.order_item_id = oi.id), 0) done
         FROM credit_order_items oi WHERE oi.order_id = ?`, [id])
      const give = new Map<number, number>(lines.map((l: any) => [Number(l.order_item_id), Number(l.qty_delivered)]))
      if (allLines.some((r: any) => Number(r.quantity) - Number(r.done) - (give.get(Number(r.id)) ?? 0) > 0.005))
        throw createError({ statusCode: 400, statusMessage: 'Partial deliveries are switched off (Settings → Orders) — this delivery must cover everything still owed on the order' })
    }
    // customer_ledger + GL at DISPATCH (workflow ship transition) — the
    // accounting pivot. Deliveries only record physical movement.

    // ── Quantity-shortfall guard ──────────────────────────────────────────
    // A caller can submit is_final=true with items that don't actually cover
    // everything still owed (mismatched form data, a stale draft, a direct
    // API call) — force-closing the order as "delivered" while real units
    // remain outstanding, with no trace of the shortfall. Compute the true
    // remaining quantity across every line (ordered − delivered-to-date,
    // including this submission) and refuse to finalize silently.
    let shortfallItems: { product_id: number; variant_id: number | null; qty_short: number }[] = []
    if (is_final) {
      const [allItems] = await conn.query<any>(
        `SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id, oi.quantity,
                COALESCE((
                  SELECT SUM(di.qty_delivered)
                  FROM credit_order_delivery_items di
                  JOIN credit_order_deliveries d ON d.id = di.delivery_id
                  WHERE di.order_item_id = oi.id AND d.order_id = oi.order_id
                ), 0) AS qty_delivered_prior
         FROM credit_order_items oi WHERE oi.order_id = ?`,
        [id],
      )
      const thisSubmission = new Map<number, number>()
      for (const it of items) thisSubmission.set(Number(it.order_item_id), (thisSubmission.get(Number(it.order_item_id)) ?? 0) + Number(it.qty_delivered))
      shortfallItems = allItems
        .map((oi: any) => ({
          product_id: oi.product_id, variant_id: oi.variant_id,
          qty_short: Number(oi.quantity) - Number(oi.qty_delivered_prior) - (thisSubmission.get(oi.order_item_id) ?? 0),
        }))
        .filter((oi: any) => oi.qty_short > 0.005)

      if (shortfallItems.length) {
        const totalShort = shortfallItems.reduce((s, i) => s + i.qty_short, 0)
        if (!isAdminRole(role)) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units across ${shortfallItems.length} item(s) are still undelivered — record another partial delivery instead of marking this final, or ask an admin to override.`,
          })
        }
        if (!body?.confirm_shortfall) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units are still undelivered. Confirm you intend to close this order anyway (confirm_shortfall) — the shortfall will be recorded, not hidden.`,
          })
        }
      }
    }

    // Update order status + write workflow timeline entry
    const wfToStatus = is_final ? 'delivered' : order.status
    const wfAction   = is_final ? 'delivered' : 'partial_delivery'
    const wfComment  = `${is_final ? 'Final' : 'Partial'} delivery ${delNo} — ${totalQty} bags · ৳${totalAmount.toLocaleString()}${truck_number ? ` · Truck ${truck_number}` : ''}${discountNote}` +
      (shortfallItems.length ? ` · ⚠ closed with ${shortfallItems.reduce((s, i) => s + i.qty_short, 0).toLocaleString()} units short (admin override, confirmed)` : '')

    await transitionOrder(conn, { orderId: id, from: order.status, to: wfToStatus, action: wfAction, userId, comment: wfComment })

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
