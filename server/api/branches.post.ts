import { query } from '~/server/utils/db'

const ADMIN_ROLES = ['admin', 'superadmin']
const VALID_TYPES = ['factory', 'sales_region', 'office']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Branch name is required' })

  const branchType = VALID_TYPES.includes(body?.branch_type) ? body.branch_type : 'sales_region'
  const sourceId   = branchType === 'sales_region' && body?.source_branch_id
    ? Number(body.source_branch_id) : null

  if (sourceId) {
    const factory = await query(
      `SELECT id FROM branches WHERE id = ? AND branch_type = 'factory'`, [sourceId],
    ) as any[]
    if (!factory.length)
      throw createError({ statusCode: 400, statusMessage: 'Source branch must be a factory' })
  }

  const result = await query(
    `INSERT INTO branches (name, code, address, phone_number, status, branch_type, source_branch_id, is_factory)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      String(body?.code ?? '').trim().toUpperCase().slice(0, 50) || null,
      String(body?.address ?? '').trim() || null,
      String(body?.phone ?? '').trim().slice(0, 20) || null,
      body?.status === 'inactive' ? 'inactive' : 'active',
      branchType,
      sourceId,
      branchType === 'factory' ? 1 : 0,
    ],
  ) as any

  return { ok: true, id: result.insertId, message: `Branch "${name}" created` }
})
