import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    supplier_name, purchase_date, notes,
    items = [],
  } = body ?? {}

  if (!purchase_date) throw createError({ statusCode: 400, statusMessage: 'Purchase date is required' })
  if (!items.length)  throw createError({ statusCode: 400, statusMessage: 'At least one item is required' })

  // Generate PO number: FMCPO-YYYYMMDD-XXXX
  const d = new Date(purchase_date)
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const [cntRow] = await query<any>(`SELECT COUNT(*) AS cnt FROM fleet_purchases WHERE DATE(purchase_date) = ?`, [purchase_date])
  const seq = String(Number((cntRow as any)?.cnt ?? 0) + 1).padStart(4, '0')
  const po_number = `FMCPO-${dateStr}-${seq}`

  // Calculate total
  const totalAmount = items.reduce((s: number, i: any) => s + Number(i.amount || 0), 0)

  // Insert PO
  const result = await query<any>(
    `INSERT INTO fleet_purchases (po_number, supplier_name, purchase_date, status, total_amount, notes)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [
      po_number,
      supplier_name?.trim() || null,
      purchase_date,
      totalAmount,
      notes || null,
    ],
  )
  const purchaseId = (result as any).insertId

  // Insert items and update stock
  for (const item of items) {
    const amount = Number(item.quantity || 0) * Number(item.unit_rate || 0)
    await query(
      `INSERT INTO fleet_purchase_items (purchase_id, item_id, item_name, quantity, unit_rate, amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        purchaseId,
        item.item_id ? Number(item.item_id) : null,
        item.item_name?.trim() || null,
        Number(item.quantity || 0),
        Number(item.unit_rate || 0),
        amount,
      ],
    )
  }

  return { ok: true, id: purchaseId, po_number }
})
