import { query } from '~/server/utils/db'

/** Company tax identity + fiscal-year-start (admin only). Used by the NBR Tax Statement draft. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const keys = ['tax_tin', 'tax_bin', 'tax_legal_name', 'tax_address', 'tax_fiscal_year_start_month']
  const rows = await query<{ setting_key: string; setting_value: string }>(
    `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${keys.map(() => '?').join(',')})`,
    keys,
  )
  const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]))
  return {
    tin: map.tax_tin ?? '',
    bin: map.tax_bin ?? '',
    legal_name: map.tax_legal_name ?? '',
    address: map.tax_address ?? '',
    fiscal_year_start_month: Number(map.tax_fiscal_year_start_month ?? 7), // Bangladesh default: July
  }
})
