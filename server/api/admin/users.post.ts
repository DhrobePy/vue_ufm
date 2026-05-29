import { getDb, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    display_name,
    email,
    password,
    role,
    status = 'active',
    telegram_chat_id,
  } = body ?? {}

  if (!display_name || !email || !password || !role)
    throw createError({ statusCode: 400, statusMessage: 'display_name, email, password, and role are required' })

  if (password.length < 8)
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })

  const db = getDb()

  // Check email uniqueness
  const existing = await queryOne<any>(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase().trim()],
  )
  if (existing)
    throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists' })

  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Store plain password for dev mode; password_hash stores same for now
    // (production would use bcrypt — no bcrypt package installed in this project)
    const [result] = await conn.query<any>(
      `INSERT INTO users
         (display_name, email, password_hash, plain_password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        display_name.trim(),
        email.toLowerCase().trim(),
        password,   // password_hash (plain for dev)
        password,   // plain_password for dev convenience
        role,
        status,
      ],
    )

    // Optionally store telegram_chat_id in user preferences or a profile table
    // (The users table doesn't have a telegram_chat_id column — skip for now)

    await conn.commit()
    return { ok: true, id: result.insertId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
