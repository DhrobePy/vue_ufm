import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole, queuePendingRequest } from '~/server/utils/creditOrders'
import { postPosSale, getPosCustomerOutstanding, POS_VALID_METHODS } from '~/server/utils/posSale'
import { getDeliveryQrSecret, posExitQrSignature } from '~/server/utils/qrDelivery'

/**
 * POST /api/pos/complete — records a POS sale with an optional cash+credit
 * split on the SAME sale (legacy parity). The "paid now" portion posts to
 * whichever account (petty cash or bank) the till selected; the "on credit"
 * portion posts to Accounts Receivable and a pos_customer_ledger debit row
 * (POS keeps its own ledger, deliberately separate from Credit Sales').
 *
 * Standalone POS credit-limit gate (deliberately NOT the Credit Sales
 * delegated-limit/maker-checker engine — a simple per-customer cap check):
 * if this sale's credit portion would push the customer's POS balance past
 * customers.credit_limit, a non-admin's sale is blocked from posting at all
 * and queued for admin-only approval (matches legacy's pos_credit_sale
 * request type, which is explicitly admin-only, not accounts-eligible).
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const isAdmin  = isAdminRole(role)

  const {
    branch_id    = 1,
    customer_id  = null,
    items        = [],
    discount     = 0,
    payment_method = 'Cash',
    cash_amount    = null,
    credit_amount  = 0,
    cash_account_id = null,
    bank_account_id = null,
    payment_reference = null,
  } = body ?? {}

  if (!items?.length) throw createError({ statusCode: 400, statusMessage: 'No items in cart' })
  if (!POS_VALID_METHODS.includes(payment_method))
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment method' })

  const subtotal = items.reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.quantity), 0)
  const total    = Math.max(0, subtotal - Number(discount || 0))
  const creditAmt = Math.max(0, Math.min(Number(credit_amount) || 0, total))

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // ── Standalone POS credit-limit gate ────────────────────────────────
    if (creditAmt > 0.009 && customer_id) {
      const [[customer]] = await conn.query<any>(`SELECT id, name, credit_limit FROM customers WHERE id = ? FOR UPDATE`, [customer_id])
      if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
      const existing = await getPosCustomerOutstanding(conn, customer_id)
      const limit = Number(customer.credit_limit ?? 0)
      if (existing + creditAmt > limit && !isAdmin) {
        const reqId = await queuePendingRequest(conn, {
          requestType: 'pos_credit_sale',
          payload: body,
          customerId: customer_id,
          amount: total,
          referenceLabel: `POS credit sale for ${customer.name} — ৳${creditAmt.toLocaleString()} would push balance to ৳${(existing + creditAmt).toLocaleString()} against a ৳${limit.toLocaleString()} limit`,
          requestedBy: userId,
          requestedReason: `Exceeds POS credit limit (৳${limit.toLocaleString()})`,
        })
        await conn.commit()
        sendTelegram(
          `⏳ <b>POS Credit Sale Queued</b>\n${customer.name} — ৳${creditAmt.toLocaleString()} on credit\nWould push balance to ৳${(existing + creditAmt).toLocaleString()} vs ৳${limit.toLocaleString()} limit\nRequested by ${userName} — admin approval required`,
          'orders')
        return {
          ok: true, queued: true, pending_request_id: reqId,
          message: `This sale exceeds the customer's credit limit and has been sent to an admin for approval. Do not release the goods yet.`,
        }
      }
    }

    const result = await postPosSale(conn, {
      branchId: branch_id, customerId: customer_id, items, discount: Number(discount || 0),
      paymentMethod: payment_method, cashAmount: cash_amount, creditAmount: creditAmt,
      cashAccountId: cash_account_id, bankAccountId: bank_account_id,
      paymentReference: payment_reference, userId, isAdmin,
    })

    await auditLog(conn, {
      userId, action: 'created', module: 'other', recordType: 'pos_order',
      recordId: result.orderId, referenceNumber: result.orderNumber,
      description: `POS sale ${result.orderNumber} — ৳${total.toLocaleString()} (cash ৳${result.cashAmount.toLocaleString()} / credit ৳${result.creditAmount.toLocaleString()})`,
      severity: 'info',
    })

    await conn.commit()

    // QR verify URL for the printed receipt (only meaningful when part of
    // the sale is unpaid — but always included, cheap to compute).
    const secret = await getDeliveryQrSecret(conn)
    const sig = posExitQrSignature(result.orderNumber, secret)
    const origin = getRequestURL(event).origin
    const verifyUrl = `${origin}/pos/exit/${result.orderId}?sig=${sig}`

    return {
      ok: true, order_number: result.orderNumber, order_id: result.orderId, total: result.total,
      cash_amount: result.cashAmount, credit_amount: result.creditAmount, exit_status: result.exitStatus,
      verify_url: verifyUrl,
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
