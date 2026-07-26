import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES, ACCOUNTS_ROLES, DISPATCH_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'
import crypto from 'node:crypto'

/**
 * POST /api/trading/sales/:id/dispatch — the two-stage commodity dispatch:
 *   action=gate_out  — goods left the warehouse (driver/vehicle captured)
 *   action=deliver   — delivery confirmed at the customer (LOCKS — UNIQUE
 *                      sale_id makes double delivery impossible at the DB)
 * Own tables + own HMAC namespace ('CTDELIV|'), mirroring the credit-sales
 * two-stage flow but with NO dispatch-hold gate — trading has no
 * Payment-Watch equivalent by design.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const ip       = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? null

  const canDispatch = await userCanAction({
    userId, role, module: 'trading', page: 'dispatch', action: 'dispatch',
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES, ...DISPATCH_ROLES],
  })
  if (!canDispatch) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to dispatch commodity sales' })

  const action = String(body?.action ?? '')
  if (!['gate_out', 'deliver'].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be gate_out or deliver' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[sale]] = await conn.query<any>(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`, [id],
    )
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
    if (sale.status !== 'posted') throw createError({ statusCode: 409, statusMessage: `Sale is ${sale.status}` })

    // Optional QR signature check (public scan flow includes ?sig=)
    if (body?.sig) {
      const [[secretRow]] = await conn.query<any>(
        `SELECT setting_value FROM system_settings WHERE setting_key = 'invoice_qr_secret'`,
      )
      if (secretRow?.setting_value) {
        const expected = crypto.createHmac('sha256', secretRow.setting_value)
          .update(`CTDELIV|${sale.sale_number}`).digest('hex').slice(0, 16)
        if (expected !== String(body.sig))
          throw createError({ statusCode: 403, statusMessage: 'Invalid QR signature' })
      }
    }

    const [[conf]] = await conn.query<any>(
      `SELECT * FROM commodity_dispatch_confirmations WHERE sale_id = ? FOR UPDATE`, [id],
    )

    let stage: string
    if (action === 'gate_out') {
      if (conf?.gate_out_at) throw createError({ statusCode: 409, statusMessage: `Already gated out on ${conf.gate_out_at}` })
      await conn.query(
        `INSERT INTO commodity_dispatch_confirmations
           (sale_id, sale_number, gate_out_at, gate_out_by_user_id, gate_out_by_name,
            driver_name, vehicle_number, gate_note)
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           gate_out_at = NOW(), gate_out_by_user_id = VALUES(gate_out_by_user_id),
           gate_out_by_name = VALUES(gate_out_by_name), driver_name = VALUES(driver_name),
           vehicle_number = VALUES(vehicle_number), gate_note = VALUES(gate_note)`,
        [id, sale.sale_number, userId, userName,
         body?.driver_name ?? null, body?.vehicle_number ?? null, body?.note ?? null],
      )
      stage = 'gate_out'
    } else {
      if (!conf?.gate_out_at) throw createError({ statusCode: 409, statusMessage: 'Gate-out must be recorded before delivery confirmation' })
      if (conf?.confirmed_at) {
        // Reuse — log + alert, then refuse (double delivery)
        await conn.query(
          `INSERT INTO commodity_qr_scan_log (sale_id, sale_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
           VALUES (?, ?, 'done', 1, ?, ?, ?)`,
          [id, sale.sale_number, userId, userName, ip],
        )
        await conn.commit()
        sendTelegram(
          `⚠️ <b>COMMODITY QR RE-SCANNED AFTER DELIVERY</b>\n${sale.sale_number} — already delivered ${conf.confirmed_at}\nScanned again by ${userName}`,
          'dispatch')
        throw createError({ statusCode: 409, statusMessage: `Already delivered on ${conf.confirmed_at} by ${conf.confirmed_by_name}` })
      }
      await conn.query(
        `UPDATE commodity_dispatch_confirmations
         SET confirmed_at = NOW(), confirmed_by_user_id = ?, confirmed_by_name = ?, received_by = ?, note = ?
         WHERE sale_id = ?`,
        [userId, userName, body?.received_by ?? null, body?.note ?? null, id],
      )
      stage = 'delivered'
    }

    await conn.query(
      `INSERT INTO commodity_qr_scan_log (sale_id, sale_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
      [id, sale.sale_number, stage, userId, userName, ip],
    )
    await auditLog(conn, {
      userId, action: stage === 'delivered' ? 'delivered' : 'status_changed',
      module: 'trading', recordType: 'commodity_sale', recordId: id, referenceNumber: sale.sale_number,
      description: `Commodity ${sale.sale_number} ${stage === 'delivered' ? 'delivery confirmed' : 'gated out'} by ${userName}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(
      stage === 'delivered'
        ? `📦 <b>Commodity Delivered</b>\n${sale.sale_number} — ${sale.customer_name}\nConfirmed by ${userName}`
        : `🚚 <b>Commodity Gate-Out</b>\n${sale.sale_number} — ${sale.customer_name}\n${body?.vehicle_number ? `Vehicle ${body.vehicle_number} · ` : ''}by ${userName}`,
      'dispatch')
    return { ok: true, stage }
  } catch (e) {
    await conn.rollback().catch(() => {})
    throw e
  } finally {
    conn.release()
  }
})
