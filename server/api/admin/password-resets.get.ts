import { query } from '~/server/utils/db'

/** GET /api/admin/password-resets — people who used "Forgot password?" and have not been given a new password yet (unknown e-mails are not listed). */
export default defineEventHandler(async () => ({
  requests: await query<any>(
    `SELECT r.id, r.user_id, u.display_name, r.email, MAX(r.created_at) AS requested_at, COUNT(*) AS times
     FROM password_reset_requests r JOIN users u ON u.id = r.user_id
     WHERE r.status = 'open' AND r.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) GROUP BY r.user_id ORDER BY requested_at DESC LIMIT 20`).catch(() => []),
}))
