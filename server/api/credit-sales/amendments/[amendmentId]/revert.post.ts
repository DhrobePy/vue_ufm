import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ADMIN_ROLES, nextDocNumber } from '~/server/utils/creditOrders'
import { applyAmendment, AMD_PRE_STATUSES, AMD_POST_STATUSES } from '~/server/utils/amendments'

/**
 * Backtrack an applied amendment: puts the lines (qty / price / discount / product) back as they were before it, and —
 * after dispatch — posts the opposite debit/credit note so the ledger follows. It is recorded as a NEW amendment
 * ("reverts AMD-…"), so the history keeps both and nothing is erased. Admin only.
 *
 * Only while the order is still in the same stage as the amendment (before dispatch ↔ before dispatch,
 * after ↔ after); otherwise the situation has moved on and a fresh amendment is the right tool.
 * An amendment can be reverted once, and only if nothing later has touched the same lines.
 */
export default defineEventHandler(async (event) => {
  const amendmentId = Number(getRouterParam(event, 'amendmentId'))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role)) throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin may revert an amendment' })
  const body = await readBody(event)
  const why = String(body?.reason ?? '').trim()
  if (why.length < 3) throw createError({ statusCode: 400, statusMessage: 'A reason is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[amd]] = await conn.query<any>(`SELECT * FROM order_amendments WHERE id = ? FOR UPDATE`, [amendmentId])
    if (!amd) throw createError({ statusCode: 404, statusMessage: 'Amendment not found' })
    if (amd.status !== 'approved') throw createError({ statusCode: 409, statusMessage: 'Only an applied (approved) amendment can be reverted' })
    if (amd.reverts_amendment_id) throw createError({ statusCode: 409, statusMessage: 'This amendment is itself a revert — raise a new amendment instead' })
    const [[already]] = await conn.query<any>(`SELECT COUNT(*) c FROM order_amendments WHERE reverts_amendment_id = ? AND status <> 'rejected'`, [amendmentId])
    if (Number(already.c) > 0) throw createError({ statusCode: 409, statusMessage: 'This amendment has already been reverted' })

    const [[order]] = await conn.query<any>(`SELECT o.*, c.name customer_name FROM credit_orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = ? FOR UPDATE`, [amd.order_id])
    const regimeNow = AMD_PRE_STATUSES.includes(order.status) ? 'pre' : AMD_POST_STATUSES.includes(order.status) ? 'post' : null
    if (regimeNow !== amd.regime)
      throw createError({ statusCode: 409, statusMessage: `The order has moved on (now "${order.status}") — it can no longer be reverted automatically. Raise a new amendment for the difference.` })
    const consent = String(body?.consent_note ?? '').trim().slice(0, 255)
    if (amd.regime === 'post' && !consent)
      throw createError({ statusCode: 400, statusMessage: "Note how/when the customer agreed to this change (it alters an invoice they already owe)" })

    // Nothing later may have touched the same lines.
    const [later] = await conn.query<any[]>(`SELECT id FROM order_amendments WHERE order_id = ? AND id > ? AND status = 'approved' AND regime = ?`, [amd.order_id, amendmentId, amd.regime])
    if (later.length) throw createError({ statusCode: 409, statusMessage: 'A later amendment exists on this order — revert that one first' })

    const oldV = amd.old_values ? JSON.parse(amd.old_values) : {}
    const newV = amd.new_values ? JSON.parse(amd.new_values) : {}
    let newValues: any, flat: number | null = null, delta: number
    if (Array.isArray(oldV.items) && oldV.items.length && Array.isArray(newV.items)) {
      const items = oldV.items.map((o: any) => ({
        item_id: o.id, product_id: o.product_id, variant_id: o.variant_id, quantity: Number(o.quantity),
        unit_price: Number(o.unit_price), discount_amount: Number(o.discount_amount ?? 0),
      }))
      const [cur] = await conn.query<any[]>(`SELECT line_total FROM credit_order_items WHERE order_id = ?`, [amd.order_id])
      const curSub = cur.reduce((s, i) => s + Number(i.line_total), 0)
      const backSub = items.reduce((s: number, i: any) => s + i.quantity * i.unit_price - i.discount_amount, 0)
      delta = Math.round((backSub - curSub) * 100) / 100
      newValues = { items, new_subtotal: backSub, total_amount: Number(order.total_amount) + delta }
      if (amd.regime === 'post') flat = delta
    } else if (amd.flat_amount != null) {
      flat = -Number(amd.flat_amount); delta = flat; newValues = { flat_amount: flat }
    } else throw createError({ statusCode: 409, statusMessage: 'Nothing to revert on this amendment' })

    const amdNo = await nextDocNumber(conn, 'AMD', 'order_amendments', 'amendment_number')
    const [res] = await conn.query<any>(
      `INSERT INTO order_amendments (amendment_number, order_id, regime, amend_type, description, old_values, new_values, flat_amount,
         status, requested_by, decided_by, decided_at, decision_note, customer_consent_note, reverts_amendment_id)
       VALUES (?, ?, ?, 'revert', ?, ?, ?, ?, 'approved', ?, ?, NOW(), ?, ?, ?)`,
      [amdNo, amd.order_id, amd.regime, `Revert of ${amd.amendment_number}: ${why}`.slice(0, 500),
       JSON.stringify({ total_amount: Number(order.total_amount) }), JSON.stringify(newValues), flat, userId, userId, 'Reverted by admin', consent || null, amendmentId])
    await applyAmendment(conn, { amendmentId: res.insertId, order, regime: amd.regime, flatAmount: flat, newValues, amdNo, userId, reason: `revert of ${amd.amendment_number} — ${why}` })

    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'amendment_reverted', ?, ?, NOW())`,
      [amd.order_id, order.status, order.status, userId, `${amdNo} reverts ${amd.amendment_number} (Δ৳${delta.toLocaleString()}) — ${why}`])
    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales', recordType: 'order_amendment', recordId: res.insertId, referenceNumber: amdNo,
      description: `Amendment ${amd.amendment_number} on ${order.order_number} reverted by ${amdNo} (Δ৳${delta.toLocaleString()}) — ${why}`, severity: 'warning',
    })
    await conn.commit()
    return { ok: true, amendment_number: amdNo, delta }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})
