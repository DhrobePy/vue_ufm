import { query } from '~/server/utils/db'
import { ADMIN_ROLES, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (![...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = Number(event.context.params?.id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' })

  const body = await readBody(event)
  const { name, account_number, description, status, is_active } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (name           !== undefined) { sets.push('name = ?');           params.push(String(name).trim()) }
  if (account_number !== undefined) { sets.push('account_number = ?'); params.push(account_number?.trim() || null) }
  if (description    !== undefined) { sets.push('description = ?');    params.push(description?.trim() || null) }
  if (status         !== undefined) { sets.push('status = ?');         params.push(status) }
  if (is_active       !== undefined) { sets.push('is_active = ?');     params.push(is_active ? 1 : 0) }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  params.push(id)
  await query(`UPDATE chart_of_accounts SET ${sets.join(', ')} WHERE id = ?`, params)

  return { ok: true }
})
