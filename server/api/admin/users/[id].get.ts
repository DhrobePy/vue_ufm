import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const user = await queryOne<any>(
    `SELECT id, display_name, email, role, status, last_login, created_at
     FROM users WHERE id = ?`,
    [id],
  )

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return { user }
})
