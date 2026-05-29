import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    position_id,
    hire_date,
    base_salary,
    branch_id,
    status = 'active',
  } = body ?? {}

  if (!first_name || !last_name || !email || !hire_date)
    throw createError({ statusCode: 400, statusMessage: 'first_name, last_name, email, and hire_date are required' })

  const result = await query(
    `INSERT INTO employees
       (first_name, last_name, email, phone, address,
        position_id, hire_date, base_salary, branch_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      phone    || null,
      address  || null,
      position_id ? Number(position_id) : null,
      hire_date,
      base_salary ? Number(base_salary) : 0,
      branch_id ? Number(branch_id) : 1,
      status,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})
