import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await query(`
    SELECT hfe.employee_id,
           hfe.face_descriptor AS descriptor,
           CONCAT(e.first_name, ' ', e.last_name) AS name,
           e.branch_id
    FROM hr_face_encodings hfe
    JOIN hr_employees e ON e.id = hfe.employee_id
    WHERE e.status = 'active'
      AND hfe.face_descriptor IS NOT NULL
  `) as any[]

  const valid: any[] = []
  for (const r of rows) {
    try {
      const d: number[] = typeof r.descriptor === 'string'
        ? JSON.parse(r.descriptor)
        : r.descriptor
      if (!Array.isArray(d) || d.length !== 128 || typeof d[0] !== 'number') continue
      valid.push({ ...r, descriptor: d.map(Number) })
    } catch { /* skip malformed */ }
  }

  return { success: true, employees: valid, count: valid.length }
})
