import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { APP_SETTING_GROUPS, resetAppSettingsCache, type AppSettingGroup } from '~/server/utils/appSettings'

/**
 * PUT /api/settings/app   Body: { group: 'company_profile' | 'finance_settings' | 'order_policy' | 'security_policy' | 'notify_policy', values: {…} }
 * Admin / superadmin only. Unknown keys are ignored; values are coerced to the type of the default.
 * Saving the company tax details / fiscal year also keeps the Tax Statement's own settings in step.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  const userId = Number((session?.user as any)?.id ?? 0)
  if (!['admin', 'superadmin'].includes(role)) throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin can change settings' })
  const body = await readBody(event)
  const group = String(body?.group ?? '') as AppSettingGroup
  const defaults: any = (APP_SETTING_GROUPS as any)[group]
  if (!defaults) throw createError({ statusCode: 400, statusMessage: 'Unknown settings group' })

  const clean: any = {}
  for (const [k, d] of Object.entries(defaults)) {
    const v = body?.values?.[k]
    if (v === undefined) continue
    if (typeof d === 'boolean') clean[k] = Boolean(v)
    else if (typeof d === 'number') {
      const n = Number(v)
      if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: `"${k}" must be a number, zero or more` })
      clean[k] = n
    } else clean[k] = String(v).trim().slice(0, 500)
  }
  if (group === 'company_profile' && clean.name !== undefined && !clean.name) throw createError({ statusCode: 400, statusMessage: 'Company name cannot be empty' })
  if (group === 'finance_settings' && clean.fyStart !== undefined && !(clean.fyStart >= 1 && clean.fyStart <= 12)) throw createError({ statusCode: 400, statusMessage: 'Financial year must start in month 1–12' })
  if (group === 'security_policy' && clean.maxLoginAttempts !== undefined && clean.maxLoginAttempts < 3) throw createError({ statusCode: 400, statusMessage: 'Allow at least 3 login attempts' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[cur]] = await conn.query<any>(`SELECT setting_value FROM system_settings WHERE setting_key = ?`, [group])
    let merged = { ...defaults, ...(cur?.setting_value ? JSON.parse(cur.setting_value) : {}), ...clean }
    const up = (k: string, v: string) => conn.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`, [k, v, userId])
    await up(group, JSON.stringify(merged))
    if (group === 'company_profile') {
      if (clean.tin !== undefined) await up('tax_tin', merged.tin)
      if (clean.bin !== undefined) await up('tax_bin', merged.bin)
      if (clean.name !== undefined) await up('tax_legal_name', merged.name)
      if (clean.address !== undefined) await up('tax_address', merged.address)
    }
    if (group === 'finance_settings' && clean.fyStart !== undefined) await up('tax_fiscal_year_start_month', String(merged.fyStart))
    await auditLog(conn, { userId, action: 'settings_updated', module: 'admin', recordType: 'system_settings', recordId: 0,
      description: `Settings "${group}" changed by ${role}: ${Object.keys(clean).join(', ')}`, severity: 'info' })
    await conn.commit()
    resetAppSettingsCache()
    return { ok: true, group, values: merged }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})
