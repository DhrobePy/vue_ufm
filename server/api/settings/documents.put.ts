import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

const ALLOWED_KEYS = ['tc_purchase_order', 'tc_credit_invoice', 'show_invoice_outstanding'] as const

/**
 * PUT /api/settings/documents
 * Saves T&C text for one or more document types.
 * Admin / superadmin only.
 *
 * Body: { tc_purchase_order?: string, tc_credit_invoice?: string }
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can update document settings' })
  }

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // system_settings table guaranteed by db-migrate startup plugin.
    const updated: string[] = []

    for (const key of ALLOWED_KEYS) {
      if (key in body && typeof body[key] === 'string') {
        await conn.query(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             setting_value = VALUES(setting_value),
             updated_by    = VALUES(updated_by),
             updated_at    = NOW()`,
          [key, body[key], userId],
        )
        updated.push(key)
      }
    }

    if (updated.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No valid settings keys provided' })
    }

    await auditLog(conn, {
      userId,
      action:      'settings_updated',
      module:      'admin',
      recordType:  'system_settings',
      recordId:    0,
      description: `Document T&C updated by ${role}: ${updated.join(', ')}`,
      severity:    'info',
    })

    await conn.commit()
    return { ok: true, updated }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
