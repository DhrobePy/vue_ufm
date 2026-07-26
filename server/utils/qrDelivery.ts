/**
 * Two-stage QR delivery (spec §2.8) — shared signature + scan-logging helpers.
 * Mirrors the legacy PHP scheme exactly (getInvoiceQrSecret/deliveryQrSignature/
 * recordQrScan in helpers.php) so a printed gate pass stays valid across the
 * rewrite: sig = first 16 hex chars of HMAC-SHA256('DELIV|'+orderNumber, secret).
 */
import crypto from 'node:crypto'
import { sendTelegram } from '~/server/utils/telegram'

const SECRET_KEY = 'invoice_qr_secret'

/** Lazily create + cache the HMAC secret in system_settings (never leaves the server). */
export async function getDeliveryQrSecret(conn: any): Promise<string> {
  const [[row]] = await conn.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`, [SECRET_KEY],
  )
  if (row?.setting_value) return row.setting_value

  const secret = crypto.randomBytes(24).toString('hex')
  await conn.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = setting_value`,
    [SECRET_KEY, secret],
  )
  // Another request may have raced us to the INSERT — re-read to get whichever won.
  const [[row2]] = await conn.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`, [SECRET_KEY],
  )
  return row2?.setting_value ?? secret
}

export function deliveryQrSignature(orderNumber: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`DELIV|${orderNumber}`).digest('hex').slice(0, 16)
}

export async function verifyDeliveryQrSignature(conn: any, orderNumber: string, sig: string): Promise<boolean> {
  const secret = await getDeliveryQrSecret(conn)
  const expected = deliveryQrSignature(orderNumber, secret)
  // Constant-time compare — same length required or timingSafeEqual throws.
  if (expected.length !== sig.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}

/**
 * Log one scan/action attempt. A scan while stage is already 'done' (order
 * already delivered) is a reuse — flagged and Telegram-alerted (possible
 * double delivery). Returns the running scan count for this order.
 */
export async function recordQrScan(conn: any, opts: {
  orderId: number
  orderNumber: string
  stage: string
  scannerId: number | null
  scannerName: string
  ip: string | null
}): Promise<number> {
  const reused = opts.stage === 'done' ? 1 : 0
  await conn.query(
    `INSERT INTO cr_qr_scan_log
       (order_id, order_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [opts.orderId, opts.orderNumber, opts.stage, reused, opts.scannerId, opts.scannerName, opts.ip],
  )
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS c FROM cr_qr_scan_log WHERE order_id = ?`, [opts.orderId],
  )
  const total = Number(row?.c ?? 0)
  if (reused) {
    sendTelegram(
      `⚠️ <b>QR RE-SCANNED AFTER DELIVERY</b>\n` +
      `Order: ${opts.orderNumber}\n` +
      `Already delivered — scanned again by ${opts.scannerName}\n` +
      `Total scans on this QR: ${total}\n\n` +
      `Possible duplicate-delivery attempt — please verify.`,
    'dispatch')
  }
  return total
}
