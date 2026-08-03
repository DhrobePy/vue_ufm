import { query } from '~/server/utils/db'

/** GET /api/pos/:id — POS order detail (items, customer, journal, exit status). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order' })

  const [[order], items, jeLines] = await Promise.all([
    query<any>(
      `SELECT o.*, c.name AS customer_name, b.name AS branch_name,
              cb.display_name AS cleared_by_name, rb.display_name AS requested_by_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.branch_id
       LEFT JOIN users cb ON cb.id = o.exit_cleared_by_user_id
       LEFT JOIN users rb ON rb.id = o.exit_requested_by_user_id
       WHERE o.id = ? AND o.order_type = 'POS'`, [id]) as any[],
    query<any>(
      `SELECT oi.*, pv.weight_variant, pv.sku, p.base_name
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE oi.order_id = ?`, [id]),
    query<any>(
      `SELECT tl.*, coa.name AS account_name FROM transaction_lines tl
       JOIN chart_of_accounts coa ON coa.id = tl.account_id
       JOIN orders o ON o.journal_entry_id = tl.journal_entry_id
       WHERE o.id = ?`, [id]),
  ])
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  return { order, items, je_lines: jeLines }
})
