import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES, getGLAccountId, postJournalEntry } from '~/server/utils/creditOrders'

/**
 * PATCH /api/products/stock-adjustments/:id/status
 * Body: { action: 'approve' | 'reject', notes?: string }
 * Maker/checker (spec §2.9): admin/superadmin only; the submitter cannot
 * decide their own adjustment. On approve: stock_qty moves and a balanced
 * JE posts (decrease = loss: DR COGS / CR Inventory; increase: DR Inventory / CR Other Income).
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid adjustment ID' })

  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body   = await readBody(event)
  const action = body?.action as 'approve' | 'reject'
  const notes  = body?.notes as string | undefined
  if (!['approve', 'reject'].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[adj]] = await conn.query<any>(
      `SELECT sa.*, pv.sku, pv.stock_qty, p.base_name AS product_name
       FROM stock_adjustments sa
       JOIN product_variants pv ON pv.id = sa.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE sa.id = ? FOR UPDATE`,
      [id],
    )
    if (!adj) throw createError({ statusCode: 404, statusMessage: 'Adjustment not found' })
    if (adj.status !== 'pending')
      throw createError({ statusCode: 409, statusMessage: `Already ${adj.status}` })
    if (Number(adj.created_by_user_id) === userId)
      throw createError({ statusCode: 403, statusMessage: 'You recorded this adjustment — a different authorised user must decide it' })

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const delta = Number(adj.delta)
    let jeId: number | null = null

    if (action === 'approve') {
      await conn.query(
        `UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty + ?), updated_at = NOW() WHERE id = ?`,
        [delta, adj.variant_id],
      )

      const date = new Date().toISOString().slice(0, 10)
      const invId = await getGLAccountId(conn, 'Other Current Asset')
      const offsetId = delta < 0
        ? await getGLAccountId(conn, 'Cost of Goods Sold')
        : await getGLAccountId(conn, 'Other Income')

      if (invId && offsetId) {
        const lines = delta < 0
          ? [
              { accountId: offsetId, debit: Math.abs(delta), credit: 0, memo: adj.adj_number },
              { accountId: invId,    debit: 0, credit: Math.abs(delta), memo: adj.adj_number },
            ]
          : [
              { accountId: invId,    debit: delta, credit: 0, memo: adj.adj_number },
              { accountId: offsetId, debit: 0, credit: delta, memo: adj.adj_number },
            ]
        jeId = await postJournalEntry(conn, {
          date,
          description: `Stock adjustment ${adj.adj_number} — ${adj.product_name} (${adj.sku})`,
          docType: 'StockAdjustment',
          docId: id,
          userId,
          lines,
        })
      }
    }

    await conn.query(
      `UPDATE stock_adjustments
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(), decision_note = ?, journal_entry_id = ?
       WHERE id = ?`,
      [newStatus, userId, notes ?? null, jeId, id],
    )

    await auditLog(conn, {
      userId, action: action === 'approve' ? 'approved' : 'rejected', module: 'products',
      recordType: 'stock_adjustment', recordId: id, referenceNumber: adj.adj_number,
      description: `Stock adjustment ${adj.adj_number} (${adj.product_name}, ${adj.sku}) ${action}d — ${delta > 0 ? '+' : ''}${delta}${notes ? ` · ${notes}` : ''}`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `${action === 'approve' ? '✅' : '❌'} <b>Stock Adjustment ${action === 'approve' ? 'Approved' : 'Rejected'}</b>\n` +
      `${adj.adj_number} — ${adj.product_name} (${adj.sku})\n${delta > 0 ? '+' : ''}${delta} bags · by ${userName}`,
    )
    return { ok: true, status: newStatus }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
