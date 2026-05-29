import bcrypt from 'bcryptjs'
import { queryOne } from '~/server/utils/db'

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

  // ─── Dev-mode fallback (when DB is down or NUXT_DEV_LOGIN=true) ──────────
  const config = useRuntimeConfig()
  const devLoginEnabled = config.devLogin === 'true' || config.devLogin === true || !!dbError

  if (!user && devLoginEnabled) {
    const devUser = DEV_USERS[emailLower]
    if (!devUser || devUser.password !== password)
      throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })

    await setUserSession(event, {
      user: { id: devUser.id, name: devUser.name, email: emailLower, role: devUser.role },
    })
    return { ok: true, user: { id: devUser.id, name: devUser.name, role: devUser.role } }
  }

  // ─── DB is up: normal auth path ──────────────────────────────────────────
  if (!user)
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })

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

  if (!plainMatch && !bcryptMatch)
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })

  await setUserSession(event, {
    user: {
      id:    user.id,
      name:  user.display_name,
      email: user.email,
      role:  user.role,
    },
  })

  return { ok: true, user: { id: user.id, name: user.display_name, role: user.role } }
})
