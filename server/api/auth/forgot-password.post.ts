import { query } from '~/server/utils/db'
import { sendTelegram } from '~/server/utils/telegram'

/**
 * POST /api/auth/forgot-password { email }
 * There is no e-mail service, so this does not send a reset link. It records the request, tells the administrators on Telegram and
 * lists it in Admin → Users; an administrator then sets a new password for that person (existing "edit user" screen).
 * The answer is always the same, whether or not the e-mail belongs to a user, so it cannot be used to discover accounts.
 * Limits: 3 requests per e-mail and 10 per IP per hour.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event), email = String(body?.email ?? '').trim().toLowerCase().slice(0, 190)
  const ip = String(getRequestIP(event, { xForwardedFor: true }) ?? '0.0.0.0').slice(0, 45)
  const answer = { ok: true, message: 'If that e-mail belongs to an account, the administrator has been told and will set a new password for you. Please contact them if it is urgent.' }
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Enter the e-mail address you sign in with.' })
  try {
    const [byEmail] = await query<any>(`SELECT COUNT(*) n FROM password_reset_requests WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`, [email])
    const [byIp] = await query<any>(`SELECT COUNT(*) n FROM password_reset_requests WHERE ip_address = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`, [ip])
    if (Number(byEmail.n) >= 3 || Number(byIp.n) >= 10) return answer           // quietly ignore floods
    const [u] = await query<any>(`SELECT id, display_name, status FROM users WHERE email = ? LIMIT 1`, [email])
    await query(`INSERT INTO password_reset_requests (email, user_id, ip_address) VALUES (?, ?, ?)`, [email, u?.id ?? null, ip])
    if (u && u.status === 'active') {
      const esc = (s: string) => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
      sendTelegram(`🔑 <b>Password reset requested</b>\n${esc(String(u.display_name))} (${esc(email)})\nSet a new password in Admin → Users, then tell them.`).catch(() => {})
    }
  } catch (e) { console.warn('[forgot-password]', e) }
  return answer
})
