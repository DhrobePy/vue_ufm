import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const section = (q.section as string) || 'general'

  if (section === 'general') {
    const rows = await query('SELECT name, value FROM hr_settings')
    const settings: Record<string, string> = {}
    for (const r of rows as any[]) settings[r.name] = r.value
    return { settings }
  }

  if (section === 'overtime') {
    const s = await queryOne('SELECT * FROM hr_overtime_settings WHERE id = 1')
    return { settings: s }
  }

  if (section === 'pf') {
    const s = await queryOne('SELECT * FROM hr_pf_settings WHERE id = 1')
    return { settings: s }
  }

  if (section === 'gratuity') {
    const s = await queryOne('SELECT * FROM hr_gratuity_settings WHERE id = 1')
    return { settings: s }
  }

  if (section === 'tax') {
    const s = await queryOne('SELECT * FROM hr_tax_settings WHERE id = 1')
    return { settings: s }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown section' })
})
