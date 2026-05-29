import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const body = await readBody(event)
  const {
    display_name,
    email,
    role,
    status,
    password,
  } = body ?? {}

  if (!display_name || !email || !role)
    throw createError({ statusCode: 400, statusMessage: 'display_name, email, and role are required' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Base update without password
    const setClauses: string[] = [
      'display_name = ?',
      'email = ?',
      'role = ?',
      'status = ?',
    ]
    const params: unknown[] = [
      display_name.trim(),
      email.toLowerCase().trim(),
      role,
      status ?? 'active',
    ]

    // Optionally update password if provided
    if (password && password.length >= 8) {
      setClauses.push('password_hash = ?', 'plain_password = ?')
      params.push(password, password)
    }

    params.push(id)
    await conn.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    )

    await conn.commit()
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
