import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { action, employee_id } = await readBody(event)

  if (action === 'delete') {
    if (!employee_id) throw createError({ statusCode: 400, statusMessage: 'employee_id required' })
    await query('DELETE FROM hr_face_encodings WHERE employee_id = ?', [employee_id])
    return { ok: true, message: 'Face ID deleted.' }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
