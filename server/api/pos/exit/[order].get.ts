import { query, getDb } from '~/server/utils/db'
import { getDeliveryQrSecret, posExitQrSignature, recordPosExitScan } from '~/server/utils/qrDelivery'
import crypto from 'node:crypto'

/** GET /api/pos/exit/:order — gate-scan landing data + sig re-check ('POSEXIT|' namespace). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`

  const orderId = Number(getRouterParam(event, 'order'))
  if (!orderId) throw createError({ statusCode: 400, statusMessage: 'Invalid order' })
  const sig = String(getQuery(event).sig ?? '')

  const [[order]] = await query<any>(
    `SELECT o.*, c.name AS customer_name, b.name AS branch_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN branches b ON b.id = o.branch_id
     WHERE o.id = ? AND o.order_type = 'POS'`, [orderId],
  ) as any[]
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  const conn = await getDb().getConnection()
  let secret: string
  let scanCount = 0
  try {
    secret = await getDeliveryQrSecret(conn)
    scanCount = await recordPosExitScan(conn, {
      orderId, orderNumber: order.order_number,
      alreadyCleared: order.exit_status === 'cleared',
      scannerId: userId, scannerName: userName,
      ip: getRequestHeader(event, 'x-forwarded-for') ?? event.node.req.socket.remoteAddress ?? null,
    })
  } finally { conn.release() }
  const expected = posExitQrSignature(order.order_number, secret)
  const sigValid = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))

  return { order, sig_valid: sigValid, scan_count: scanCount }
})
