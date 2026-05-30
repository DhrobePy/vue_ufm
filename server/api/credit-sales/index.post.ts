import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    customer_id,
    branch_id,        // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address, // maps to shipping_address in DB
    special_notes,    // maps to special_instructions in DB
    amount_paid,      // advance payment
    items,            // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
  } = body ?? {}

  if (!customer_id || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'customer_id and items are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate order number: CR-YYYYMMDD-NNNN
    const today    = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]]  = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const orderNo = `CR-${today}-${seq}`

    // Compute totals from items — frontend sends qty_bags, DB col is quantity
    let subtotal = 0
    for (const it of items) {
      const qty  = Number(it.qty_bags ?? it.quantity ?? 0)
      const line = qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)
      subtotal  += line
    }
    const totalAmount = subtotal
    const advancePaid = Number(amount_paid ?? 0)
    const balanceDue  = Math.max(0, totalAmount - advancePaid)

    // If product_id is missing for a variant, look it up
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query<any>(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id],
        )
        it.product_id = pv?.product_id ?? null
      }
    }

    const [result] = await conn.query<any>(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?,
               ?, ?, ?, ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id ?? null,
        order_date,
        required_date || null,
        priority ?? 'normal',
        delivery_address || null,
        special_notes    || null,
        totalAmount,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
        userId,
      ],
    )

    const orderId = result.insertId

    // Insert line items — DB column is `quantity`, not `qty_bags`
    for (const it of items) {
      const qty       = Number(it.qty_bags ?? it.quantity ?? 0)
      const lineTotal = qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)

      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,            // NOT NULL in DB — looked up above if missing
          it.variant_id ?? null,
          qty,
          Number(it.unit_price),
          Number(it.discount_amount ?? 0),
          lineTotal,
        ],
      )
    }

    // Initial workflow entry — from_status is NOT NULL in DB, use 'draft'→'pending_approval'
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', 'pending_approval', 'submit', ?, 'Order created and submitted for approval', NOW())`,
      [orderId, userId],
    )

    await conn.commit()
    return { ok: true, id: orderId, order_number: orderNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
