import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action } = body ?? {}

  if (action === 'create') {
    const { holiday_date, holiday_name, description } = body
    if (!holiday_date || !holiday_name) throw createError({ statusCode: 400, statusMessage: 'Date and name required' })
    try {
      await getDb().query(
        'INSERT INTO hr_holidays (holiday_date, holiday_name, description) VALUES (?, ?, ?)',
        [holiday_date, holiday_name, description || null]
      )
      return { ok: true, message: 'Holiday added.' }
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 400, statusMessage: 'Holiday already exists for this date' })
      throw e
    }
  }

  if (action === 'delete') {
    const { id } = body
    await query('DELETE FROM hr_holidays WHERE id = ?', [id])
    return { ok: true, message: 'Holiday deleted.' }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
