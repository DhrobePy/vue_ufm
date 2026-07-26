import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, ACCOUNTS_ROLES, isAdminRole,
  getUserActionLimit, getCreditWorkflowSettings, queuePendingRequest,
} from '~/server/utils/creditOrders'
import { postCommoditySale } from '~/server/utils/commodityTrading'
import { userCanAction } from '~/server/utils/permissions'

/**
 * POST /api/trading/sales — record a commodity sale.
 *
 * Maker/checker mirrors the payment pattern: admins post directly; a
 * non-admin posts directly ONLY when the payment-approval policy is OFF and
 * they hold a commodity_sale (falls back to approve_order) ৳ limit covering
 * the sale; otherwise the sale queues into credit_pending_requests as
 * request_type 'commodity_sale' for a checker to re-post via Approval
 * Requests (is_checker_review=true bypasses, same as payments).
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const canSell = await userCanAction({
    userId, role, module: 'trading', page: 'sales', action: 'create_sale',
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES],
  })
  if (!canSell) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to record commodity sales' })

  const {
    customer_id, commodity_id, branch_id, origin, sale_date,
    quantity, unit_price, stock_override, source_purchase_order_id, notes,
    is_checker_review,
  } = body ?? {}

  if (!customer_id || !commodity_id || !quantity || !unit_price)
    throw createError({ statusCode: 400, statusMessage: 'customer, commodity, quantity and unit price are required' })

  const today = new Date().toISOString().slice(0, 10)
  let saleDate = String(sale_date || today)
  // Backdated sale_date is admin-only — everyone else is forced to today,
  // never trusted from the client (legacy create_order pattern).
  if (!isAdminRole(role)) saleDate = today
  if (saleDate > today) throw createError({ statusCode: 400, statusMessage: 'Sale date cannot be in the future' })

  const totalAmount = Math.round(Number(quantity) * Number(unit_price) * 100) / 100

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[customer]] = await conn.query<any>(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customer_id],
    )
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    // ── Maker/checker gate ────────────────────────────────────────────────
    if (!isAdminRole(role) && !is_checker_review) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn)
      const cap = await getUserActionLimit(conn, userId, 'approve_order' as any)
      const saleCap = await getUserActionLimit(conn, userId, 'commodity_sale' as any) ?? cap
      const withinCap = saleCap !== null && totalAmount <= saleCap
      if (paymentRequireApproval || !withinCap) {
        const reqId = await queuePendingRequest(conn, {
          requestType: 'commodity_sale',
          payload: body,
          customerId: Number(customer_id),
          amount: totalAmount,
          referenceLabel: `${customer.name} — commodity sale ৳${totalAmount.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: paymentRequireApproval
            ? 'Sale approval policy (all commodity sales)'
            : saleCap === null ? 'No commodity-sale limit configured' : `Exceeds commodity-sale limit of ৳${saleCap.toLocaleString()}`,
        })
        await conn.commit()
        sendTelegram(
          `⏳ <b>Commodity Sale Queued for Approval</b>\n${customer.name} — ৳${totalAmount.toLocaleString()}\nRequested by ${userName}`,
          'orders')
        return {
          ok: true, queued: true, pending_request_id: reqId,
          message: `Sale of ৳${totalAmount.toLocaleString()} queued for a checker's approval.`,
        }
      }
    }

    const result = await postCommoditySale(conn, {
      customerId: Number(customer_id),
      commodityId: Number(commodity_id),
      branchId: branch_id ? Number(branch_id) : null,
      origin: origin ?? '',
      saleDate,
      quantity: Number(quantity),
      unitPrice: Number(unit_price),
      stockOverride: Boolean(stock_override),
      sourcePurchaseOrderId: source_purchase_order_id ? Number(source_purchase_order_id) : null,
      notes: notes ?? null,
      userId,
    })

    await auditLog(conn, {
      userId, action: 'created', module: 'trading', recordType: 'commodity_sale',
      recordId: result.saleId, referenceNumber: result.saleNumber,
      description: `Commodity sale ${result.saleNumber} — ${customer.name} · ৳${result.totalAmount.toLocaleString()} · COGS ৳${result.cogs.toLocaleString()}${saleDate !== today ? ` · BACKDATED to ${saleDate}` : ''}`,
      severity: 'info', ipAddress,
    })

    await conn.commit()
    sendTelegram(
      `🌾 <b>Commodity Sale</b>\n${result.saleNumber} — ${customer.name}\n৳${result.totalAmount.toLocaleString()} · by ${userName}` +
      (stock_override ? '\n⚠️ Sold past on-hand stock (override)' : ''),
      'orders')
    return { ok: true, id: result.saleId, sale_number: result.saleNumber, total_amount: result.totalAmount }
  } catch (e: any) {
    await conn.rollback()
    if (e?.statusCode) throw e
    console.error('[trading/sales] failed:', e?.message)
    throw createError({ statusCode: 500, statusMessage: e?.sqlMessage ?? e?.message ?? 'Commodity sale failed' })
  } finally {
    conn.release()
  }
})
