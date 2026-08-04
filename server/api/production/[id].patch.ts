import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { PRODUCTION_ROLES, ADMIN_ROLES, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

const UI_TO_DB: Record<string, string> = {
  running:   'in_progress',
  paused:    'delayed',
  completed: 'completed',
  cancelled: 'delayed',
  pending:   'pending',
}

const ALLOWED_ROLES = [...PRODUCTION_ROLES, ...ADMIN_ROLES, ...ACCOUNTS_ROLES]

/**
 * PATCH /api/production/:id — update a production_schedule batch's status.
 * On the running→completed transition, this is also the one place that pushes
 * the linked credit_orders.status from 'in_production' to 'ready_to_ship'
 * (mirrors the produced→ready_to_ship mapping in
 * credit-sales/[id]/workflow.post.ts) — otherwise a batch marked complete
 * here never reaches dispatch because the order itself never moved.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ALLOWED_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  const userId   = Number((session?.user as any)?.id) || 1
  const userName = (session?.user as any)?.name ?? `User ${userId}`

  const rawId     = (event.context.params?.id as string) || ''
  const numericId = Number(rawId.replace(/^PS-/i, ''))
  if (!numericId) throw createError({ statusCode: 400, statusMessage: 'Invalid production ID' })

  const body   = await readBody(event)
  const { status, notes, bags_completed } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (status) {
    const dbStatus = UI_TO_DB[status] ?? status
    sets.push('status = ?')
    params.push(dbStatus)

    if (status === 'running') {
      sets.push('production_started_at = COALESCE(production_started_at, NOW())')
    }
    if (status === 'completed') {
      sets.push('production_completed_at = NOW()')
    }
  }

  if (notes !== undefined) {
    sets.push('notes = ?')
    params.push(notes)
  }

  if (bags_completed !== undefined) {
    sets.push('bags_completed = ?')
    params.push(Math.max(0, Number(bags_completed) || 0))
  }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    sets.push('updated_at = NOW()')
    const updateParams = [...params, numericId]
    await conn.query(
      `UPDATE production_schedule SET ${sets.join(', ')} WHERE id = ?`,
      updateParams,
    )

    let orderAdvanced = false
    if (status === 'completed') {
      const [[ps]] = await conn.query<any>(
        `SELECT order_id FROM production_schedule WHERE id = ?`, [numericId],
      )
      if (ps?.order_id) {
        const [[order]] = await conn.query<any>(
          `SELECT id, order_number, status FROM credit_orders WHERE id = ? FOR UPDATE`, [ps.order_id],
        )
        if (order && order.status === 'in_production') {
          await conn.query(
            `UPDATE credit_orders SET status = 'ready_to_ship', updated_at = NOW() WHERE id = ?`,
            [order.id],
          )
          await conn.query(
            `INSERT INTO credit_order_workflow
               (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
             VALUES (?, 'in_production', 'ready_to_ship', 'ready_to_ship', ?, ?, NOW())`,
            [order.id, userId, `Production batch #${numericId} marked complete by ${userName}`],
          )
          await auditLog(conn, {
            userId, action: 'status_changed', module: 'credit_sales',
            recordType: 'credit_order', recordId: order.id,
            referenceNumber: order.order_number,
            description: `Order ${order.order_number}: in_production → ready_to_ship (production batch #${numericId} completed)`,
            severity: 'info',
          })
          orderAdvanced = true
        }
      }
    }

    await conn.commit()

    if (orderAdvanced) {
      sendTelegram(`✅ <b>Production Complete</b>\nBatch #${numericId} — ready to ship\nby ${userName}`, 'production')
    }

    return { ok: true, orderAdvanced }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
