import { queryOne, query } from '~/server/utils/db'

/**
 * GET /api/trading/sales/:id — full detail: sale, JE lines, payments,
 * edit-chain timeline, dispatch state. If this sale was superseded by an
 * approved edit, returns { superseded_by } so the client can forward.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const sale = await queryOne<any>(
    `SELECT s.*, c.name AS customer_name, c.phone_number AS customer_phone,
            pc.name AS commodity_name, pc.unit AS commodity_unit,
            b.name AS branch_name, u.display_name AS created_by,
            po.po_number AS source_po_number
     FROM commodity_sales s
     JOIN customers c ON c.id = s.customer_id
     JOIN purchase_commodities pc ON pc.id = s.commodity_id
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.created_by_user_id
     LEFT JOIN purchase_orders_adnan po ON po.id = s.source_purchase_order_id
     WHERE s.id = ?`, [id],
  )
  if (!sale) {
    // Old link to a superseded sale? Follow the edit chain forward.
    const fwd = await queryOne<any>(
      `SELECT new_sale_id FROM commodity_sale_edits
       WHERE old_sale_id = ? AND status = 'approved' AND new_sale_id IS NOT NULL
       ORDER BY id DESC LIMIT 1`, [id],
    )
    if (fwd?.new_sale_id) return { superseded_by: fwd.new_sale_id }
    throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
  }

  const [jeLines, payments, dispatch, editsBack, editPending] = await Promise.all([
    sale.journal_entry_id
      ? query<any>(
          `SELECT tl.debit_amount, tl.credit_amount, tl.description, coa.name AS account_name
           FROM transaction_lines tl JOIN chart_of_accounts coa ON coa.id = tl.account_id
           WHERE tl.journal_entry_id = ?`, [sale.journal_entry_id])
      : Promise.resolve([]),
    query<any>(
      `SELECT p.*, u.display_name AS collected_by
       FROM commodity_sale_payments p LEFT JOIN users u ON u.id = p.created_by_user_id
       WHERE p.sale_id = ? ORDER BY p.payment_date, p.id`, [id]),
    queryOne<any>(`SELECT * FROM commodity_dispatch_confirmations WHERE sale_id = ?`, [id]),
    // Timeline: walk the chain backward (bounded 20 hops)
    (async () => {
      const chain: any[] = []
      let cur = id
      for (let i = 0; i < 20; i++) {
        const edit = await queryOne<any>(
          `SELECT e.*, ru.display_name AS requested_by, du.display_name AS decided_by
           FROM commodity_sale_edits e
           LEFT JOIN users ru ON ru.id = e.requested_by_user_id
           LEFT JOIN users du ON du.id = e.decided_by_user_id
           WHERE e.new_sale_id = ? AND e.status = 'approved'
           ORDER BY e.id DESC LIMIT 1`, [cur],
        )
        if (!edit) break
        chain.push(edit)
        cur = edit.old_sale_id
      }
      return chain.reverse()
    })(),
    queryOne<any>(
      `SELECT e.*, ru.display_name AS requested_by
       FROM commodity_sale_edits e LEFT JOIN users ru ON ru.id = e.requested_by_user_id
       WHERE e.old_sale_id = ? AND e.status = 'pending_approval' LIMIT 1`, [id]),
  ])

  return { sale, je_lines: jeLines, payments, dispatch, edit_chain: editsBack, pending_edit: editPending }
})
