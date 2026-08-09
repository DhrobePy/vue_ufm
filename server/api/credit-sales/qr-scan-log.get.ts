import { query } from '~/server/utils/db'
import { isAccountsRole, isAdminRole } from '~/server/utils/creditOrders'

/**
 * GET /api/credit-sales/qr-scan-log — filterable list of every delivery-QR
 * scan attempt (cr_qr_scan_log). Previously write-only: recordQrScan() in
 * server/utils/qrDelivery.ts has been populating this table all along, but
 * nothing ever displayed it and the Exception Radar's "QR Re-scans" tile was
 * silently counting a different, permanently-empty table instead.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role) && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })

  const q = getQuery(event)
  const reusedOnly = q.reused_only === '1' || q.reused_only === 'true'
  const dateFrom   = (q.date_from as string) || ''
  const dateTo     = (q.date_to as string) || ''
  const search     = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []
  if (reusedOnly) where.push('l.reused = 1')
  if (dateFrom) { where.push('l.scanned_at >= ?'); params.push(`${dateFrom} 00:00:00`) }
  if (dateTo)   { where.push('l.scanned_at <= ?'); params.push(`${dateTo} 23:59:59`) }
  if (search)   { where.push('l.order_number LIKE ?'); params.push(`%${search}%`) }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const rows = await query<any>(
    `SELECT l.*, o.id AS credit_order_id
     FROM cr_qr_scan_log l
     LEFT JOIN credit_orders o ON o.order_number = l.order_number
     ${w}
     ORDER BY l.scanned_at DESC
     LIMIT 300`,
    params,
  )

  const [[stats]] = await query<any>(
    `SELECT COUNT(*) AS total, SUM(reused = 1) AS reused_total,
            SUM(reused = 1 AND scanned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS reused_7d
     FROM cr_qr_scan_log`,
  )

  return { rows, stats }
})
