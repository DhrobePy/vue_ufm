import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const positions = await query(
    `SELECT p.id, p.title, d.name AS department
     FROM positions p
     LEFT JOIN departments d ON d.id = p.department_id
     ORDER BY p.title`,
  )
  return { positions }
})
