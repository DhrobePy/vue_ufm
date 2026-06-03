import { getDb, queryOne } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const actorId   = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  const {
    display_name,
    email,
    password,
    role,
    status = 'active',
  } = body ?? {}

  if (!display_name || !email || !password || !role)
    throw createError({ statusCode: 400, statusMessage: 'display_name, email, password, and role are required' })

  if (password.length < 8)
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })

  const db = getDb()

  // Check email uniqueness
  const existing = await queryOne<any>('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()])
  if (existing)
    throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists' })

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [result] = await conn.query<any>(
      `INSERT INTO users
         (display_name, email, password_hash, plain_password, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        display_name.trim(),
        email.toLowerCase().trim(),
        password,
        password,
        role,
        status,
      ],
    )

    const newId = result.insertId

    await auditLog(conn, {
      userId:      actorId,
      action:      'user_created',
      module:      'admin',
      recordType:  'user',
      recordId:    newId,
      referenceNumber: email.toLowerCase().trim(),
      description: `User "${display_name.trim()}" (${email.toLowerCase().trim()}) created with role [${role}] · status: ${status} · by ${actorName}`,
      severity:    'info',
    })

    await conn.commit()
    return { ok: true, id: newId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
