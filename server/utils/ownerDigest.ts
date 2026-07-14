/**
 * Daily owner digest (spec §2.13) — Telegram summary of yesterday's
 * business + what needs attention today. Two triggers:
 *   1. maybeTriggerOwnerDigest() — fire-and-forget, called opportunistically
 *      from the exception-radar endpoint (i.e. the first admin/accounts
 *      dashboard load of the day). Gated to run only after 6am server time
 *      and only once per calendar day.
 *   2. sendOwnerDigestNow() — used by the token-protected /api/cron/
 *      daily-digest endpoint (wire to a cPanel scheduled task). Bypasses the
 *      6am gate but still respects the once-per-day claim.
 *
 * The server's local clock is assumed to be Bangladesh time, matching the
 * existing convention elsewhere in this codebase (see payment.post.ts).
 */
import { getDb, query } from '~/server/utils/db'
import { sendTelegram } from '~/server/utils/telegram'
import { getExceptionRadar } from '~/server/utils/exceptionRadar'

const SETTING_KEY = 'last_owner_digest'

/** Atomically claim today's digest slot. Returns true if this call may proceed. */
async function claimDigestSlotForToday(): Promise<boolean> {
  const db = getDb()
  const [[today]] = await db.query(`SELECT CURDATE() AS d`) as any
  const todayStr = String(today.d)

  const [[row]] = await db.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`, [SETTING_KEY],
  ) as any
  if (row?.setting_value === todayStr) return false // already sent today

  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTING_KEY, todayStr],
  )
  return true
}

async function buildDigestMessage(): Promise<string> {
  const [collections, orders, overdue] = await Promise.all([
    query<any>(
      `SELECT payment_method, COALESCE(SUM(amount), 0) AS total
       FROM customer_payments
       WHERE payment_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
       GROUP BY payment_method`,
    ),
    query<any>(
      `SELECT COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS total
       FROM credit_orders WHERE order_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
    ),
    query<any>(
      `SELECT c.name, COALESCE(SUM(l.debit_amount), 0) - COALESCE(SUM(l.credit_amount), 0) AS outstanding
       FROM customer_ledger l JOIN customers c ON c.id = l.customer_id
       GROUP BY l.customer_id, c.name
       HAVING outstanding > 0
       ORDER BY outstanding DESC
       LIMIT 3`,
    ),
  ])

  const collectedTotal = collections.reduce((s: number, r: any) => s + Number(r.total), 0)
  const collectionLines = collections
    .filter((r: any) => Number(r.total) > 0)
    .map((r: any) => `  · ${r.payment_method}: ৳${Number(r.total).toLocaleString()}`)
    .join('\n')

  const { tiles, total: radarTotal } = await getExceptionRadar()
  const radarLines = tiles
    .filter(t => t.count > 0)
    .map(t => `  ${t.icon} ${t.label}: <b>${t.count}</b>`)
    .join('\n')

  const overdueLines = overdue
    .map((r: any, i: number) => `  ${i + 1}. ${r.name} — ৳${Number(r.outstanding).toLocaleString()}`)
    .join('\n')

  const dateLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    `📊 <b>Daily Digest — ${dateLabel}</b>\n\n` +
    `<b>Yesterday's Collections:</b> ৳${collectedTotal.toLocaleString()}\n` +
    (collectionLines || '  · none') + '\n\n' +
    `<b>Yesterday's Orders:</b> ${orders[0]?.n ?? 0} order(s) · ৳${Number(orders[0]?.total ?? 0).toLocaleString()}\n\n` +
    `<b>Exception Radar${radarTotal > 0 ? ` — ${radarTotal} need attention` : ' — all clear ✓'}</b>\n` +
    (radarLines || '  ✓ nothing outstanding') + '\n\n' +
    `<b>Top Overdue Customers:</b>\n` +
    (overdueLines || '  ✓ no overdue balances')
  )
}

/** Called from cron — bypasses the 6am gate, still once-per-day. */
export async function sendOwnerDigestNow(): Promise<{ sent: boolean }> {
  const claimed = await claimDigestSlotForToday()
  if (!claimed) return { sent: false }
  try {
    const msg = await buildDigestMessage()
    await sendTelegram(msg)
    return { sent: true }
  } catch (e) {
    console.warn('[owner-digest] failed:', e)
    return { sent: false }
  }
}

/** Fire-and-forget opportunistic trigger — never throws, never awaited by callers. */
export function maybeTriggerOwnerDigest(): void {
  ;(async () => {
    try {
      const hour = new Date().getHours() // server-local hour (Bangladesh, per codebase convention)
      if (hour < 6) return
      const claimed = await claimDigestSlotForToday()
      if (!claimed) return
      const msg = await buildDigestMessage()
      await sendTelegram(msg)
    } catch (e) {
      console.warn('[owner-digest] opportunistic trigger failed:', e)
    }
  })()
}
