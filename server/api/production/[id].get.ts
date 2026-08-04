import { queryOne } from '~/server/utils/db'

const STATUS_MAP: Record<string, string> = {
  pending:     'pending',
  in_progress: 'running',
  completed:   'completed',
  delayed:     'paused',
}

export default defineEventHandler(async (event) => {
  const rawId     = (event.context.params?.id as string) || ''
  const numericId = Number(rawId.replace(/^PS-/i, ''))
  if (!numericId) throw createError({ statusCode: 400, statusMessage: 'Invalid production ID' })

  const ps = await queryOne(
    `SELECT ps.id, ps.scheduled_date, ps.status, ps.notes, ps.priority_order,
            ps.production_started_at, ps.production_completed_at,
            ps.bags_completed, ps.target_bags,
            co.id AS credit_order_id, co.order_number,
            co.total_amount, co.total_weight_kg,
            c.name AS customer_name,
            b.name AS branch_name,
            u.display_name AS manager_name
     FROM production_schedule ps
     JOIN credit_orders co ON co.id = ps.order_id
     JOIN customers c      ON c.id  = co.customer_id
     LEFT JOIN branches b  ON b.id  = ps.branch_id
     LEFT JOIN users u     ON u.id  = ps.production_manager_id
     WHERE ps.id = ?`,
    [numericId],
  ) as any

  if (!ps) throw createError({ statusCode: 404, statusMessage: 'Production batch not found' })

  // Parse pipe-separated key:value notes
  // e.g. "Machine: Mill-1 | Shift: Morning | Operator: Rahim Khan | Raw Material: Wheat"
  const noteParts: Record<string, string> = {}
  for (const part of (ps.notes ?? '').split('|')) {
    const sep = part.indexOf(':')
    if (sep > 0) {
      const k = part.slice(0, sep).trim()
      const v = part.slice(sep + 1).trim()
      noteParts[k] = v
    }
  }

  // target_bags is set explicitly at batch-start; fall back to a weight estimate
  // (50 kg/bag) for older rows created before that column existed.
  const bagWeightKg   = 50
  const totalWeightKg = Number(ps.total_weight_kg) || 0
  const targetBags    = Number(ps.target_bags) || (totalWeightKg > 0 ? Math.ceil(totalWeightKg / bagWeightKg) : 0)

  const startedAt  = ps.production_started_at as string | null
  const startDate  = startedAt ? startedAt.slice(0, 10) : (ps.scheduled_date as string)
  const startTime  = startedAt ? startedAt.slice(11, 16) : ''

  return {
    id:          `PS-${ps.id}`,
    dbId:        ps.id as number,
    orderId:     ps.order_number as string,
    creditOrderId: ps.credit_order_id as number,
    customer:    ps.customer_name  as string,
    product:     noteParts['Product'] ?? ps.order_number,
    status:      STATUS_MAP[ps.status] ?? (ps.status as string),
    scheduledDate: ps.scheduled_date as string,
    startDate,
    startTime,
    machine:     noteParts['Machine']      ?? '—',
    shift:       noteParts['Shift']        ?? '—',
    operator:    noteParts['Operator']     ?? '—',
    rawMaterial: noteParts['Raw Material'] ?? '—',
    bagWeightKg,
    targetBags,
    doneBags:    Number(ps.bags_completed) || 0,
    branch:      (ps.branch_name  ?? '') as string,
    manager:     (ps.manager_name ?? '') as string,
    notes:       (ps.notes ?? '') as string,
    updates:     [] as any[],
    qualityChecks: [] as any[],
  }
})
