import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const branches = await query(
    `SELECT id, name, code, address, phone_number AS phone, status
     FROM branches
     ORDER BY id`,
  )
  return { branches }
})
