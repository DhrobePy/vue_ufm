import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const branches = await query(
    `SELECT id, name, code, address, phone_number AS phone, status,
            branch_type, source_branch_id
     FROM branches
     ORDER BY branch_type = 'factory' DESC, id`,
  )
  return { branches }
})
