import bcrypt from 'bcryptjs'
import { queryOne, query } from '~/server/utils/db'
import { getAppSettings } from '~/server/utils/appSettings'

interface DbUser {
  id: number
  display_name: string
  email: string
  password_hash: string
  plain_password: string | null
  role: string
  status: string
  branch_id: number | null
}

// Dev-mode hardcoded users — only active when NUXT_DEV_LOGIN=true
// Set in .env: NUXT_DEV_LOGIN=true  NUXT_DEV_USERS=admin@fmc.com:admin123:admin,user@fmc.com:pass123:user
const DEV_USERS: Record<string, { password: string; role: string; name: string; id: number }> = {
  'admin@fmc.com':   { password: 'admin123', role: 'admin',   name: 'Dev Admin',   id: 1 },
  'manager@fmc.com': { password: 'manager1', role: 'manager', name: 'Dev Manager', id: 2 },
  'user@fmc.com':    { password: 'user1234', role: 'user',    name: 'Dev User',    id: 3 },
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body ?? {}

  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })

  const emailLower = (email as string).toLowerCase().trim()

  // Lock-out after too many wrong passwords (Settings → Security → Max login attempts): 15-minute window per email.
  const maxAttempts = Math.max(3, Number((await getAppSettings()).security_policy.maxLoginAttempts) || 5)
  const recentFails = async () => {
    // failures in the last 15 minutes since this email's last successful login (the table is the legacy app's login_attempts)
    try { return Number((await queryOne<any>(
      `SELECT COUNT(*) c FROM login_attempts
       WHERE email = ? AND success = 0 AND created_at > (NOW() - INTERVAL 15 MINUTE)
         AND created_at > COALESCE((SELECT MAX(created_at) FROM login_attempts WHERE email = ? AND success = 1), '2000-01-01')`,
      [emailLower, emailLower]))?.c ?? 0) }
    catch { return 0 }
  }
  if (await recentFails() >= maxAttempts)
    throw createError({ statusCode: 429, statusMessage: `Too many failed attempts — try again in 15 minutes` })
  const failed = async () => { try { await query(`INSERT INTO login_attempts (email, success, ip_address, failure_reason) VALUES (?, 0, ?, 'bad credentials')`, [emailLower, String(getRequestIP(event, { xForwardedFor: true }) ?? '0.0.0.0').slice(0, 45)]) } catch { /* table missing — no lockout */ } }

  // ─── Try real DB first ────────────────────────────────────────────────────
  let user: DbUser | null = null
  let dbError: Error | null = null

  try {
    user = await queryOne<DbUser>(
      'SELECT id, display_name, email, password_hash, plain_password, role, status FROM users WHERE email = ? LIMIT 1',
      [emailLower],
    )
  }
  catch (err: any) {
    // ECONNREFUSED / ETIMEDOUT means the DB is not reachable — fall through to dev mode
    dbError = err
    console.warn('[login] DB unreachable, falling back to dev-mode credentials:', err?.code ?? err?.message)
  }

  // ─── Dev-mode fallback — ONLY when NUXT_DEV_LOGIN=true is set explicitly ──
  // A DB outage must never open a hardcoded-credential back door: with the
  // flag off, an unreachable DB is a plain 503, not a login path.
  const config = useRuntimeConfig()
  const devLoginEnabled = String(config.devLogin) === 'true'

  if (dbError && !devLoginEnabled)
    throw createError({ statusCode: 503, statusMessage: 'Service temporarily unavailable — please try again in a moment' })

  if (!user && devLoginEnabled) {
    const devUser = DEV_USERS[emailLower]
    if (!devUser || devUser.password !== password) {
      await failed()
      throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
    }

    await setUserSession(event, {
      user: { id: devUser.id, name: devUser.name, email: emailLower, role: devUser.role },
      loggedInAt: Date.now(),
    })
    return { ok: true, user: { id: devUser.id, name: devUser.name, role: devUser.role } }
  }

  // ─── DB is up: normal auth path ──────────────────────────────────────────
  if (!user) {
    await failed()
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  if (user.status !== 'active')
    throw createError({ statusCode: 403, statusMessage: 'Account is not active' })

  // 1. plain_password column takes priority (dev DB convenience)
  const plainMatch = !!user.plain_password && user.plain_password === password

  // 2. bcrypt comparison (PHP $2y$ hashes = bcryptjs $2b$ — same algorithm)
  let bcryptMatch = false
  if (!plainMatch && user.password_hash) {
    // Normalise PHP $2y$ → $2b$ so bcryptjs accepts it
    const normalised = user.password_hash.startsWith('$2y$')
      ? user.password_hash.replace('$2y$', '$2b$')
      : user.password_hash

    try { bcryptMatch = await bcrypt.compare(password, normalised) }
    catch { /* malformed hash — treat as no match */ }
  }

  if (!plainMatch && !bcryptMatch) {
    await failed()
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }
  try { await query(`INSERT INTO login_attempts (email, success, ip_address) VALUES (?, 1, ?)`, [emailLower, String(getRequestIP(event, { xForwardedFor: true }) ?? '0.0.0.0').slice(0, 45)]) } catch { /* ignore */ }

  await setUserSession(event, {
    user: {
      id:    user.id,
      name:  user.display_name,
      email: user.email,
      role:  user.role,
    },
    loggedInAt: Date.now(),   // Settings → Security → Session timeout counts from here
  })

  return { ok: true, user: { id: user.id, name: user.display_name, role: user.role } }
})
