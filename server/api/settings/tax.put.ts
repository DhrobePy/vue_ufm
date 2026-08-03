import { query } from '~/server/utils/db'

/** Save company tax identity + fiscal-year-start (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body = await readBody(event)
  const upsert = async (key: string, value: string) => query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value],
  )

  await upsert('tax_tin', String(body?.tin ?? '').trim())
  await upsert('tax_bin', String(body?.bin ?? '').trim())
  await upsert('tax_legal_name', String(body?.legal_name ?? '').trim())
  await upsert('tax_address', String(body?.address ?? '').trim())
  const month = Number(body?.fiscal_year_start_month)
  if (month >= 1 && month <= 12) await upsert('tax_fiscal_year_start_month', String(month))

  return { ok: true }
})
