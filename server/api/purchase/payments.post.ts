import { getDb, query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    purchase_order_id,
    payment_date,
    amount_paid,
    payment_method = 'bank',
    bank_account_id,
    reference_number,
    payment_type = 'regular',
    remarks,
  } = body ?? {}

  if (!purchase_order_id || !amount_paid || Number(amount_paid) <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'purchase_order_id and amount_paid are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the PO to get supplier info
    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, supplier_id, supplier_name, balance_payable
       FROM purchase_orders_adnan WHERE id = ?`,
      [purchase_order_id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    // Get bank name if bank_account_id provided
    let bankName: string | null = null
    if (bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT bank_name FROM bank_accounts WHERE id = ?`, [bank_account_id],
      )
      bankName = ba?.bank_name ?? null
    }

    // Generate voucher number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM purchase_payments_adnan WHERE DATE(payment_date) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const voucherNo = `PV-${today}-${seq}`

    const [result] = await conn.query<any>(
      `INSERT INTO purchase_payments_adnan
         (payment_voucher_number, payment_date, purchase_order_id, po_number,
          supplier_id, supplier_name, amount, amount_paid, payment_method,
          bank_account_id, bank_name, reference_number,
          payment_type, remarks, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherNo,
        payment_date ?? new Date().toISOString().slice(0, 10),
        purchase_order_id,
        po.po_number,
        po.supplier_id,
        po.supplier_name,
        Number(amount_paid),   // amount  (original column — keeps NOT NULL satisfied)
        Number(amount_paid),   // amount_paid (extended column)
        payment_method,
        bank_account_id ? Number(bank_account_id) : null,
        bankName,
        reference_number ?? null,
        payment_type,
        remarks ?? null,
        userId,
      ],
    )

    // Update total_paid on the PO
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_paid      = COALESCE(total_paid, 0) + ?,
           balance_payable = GREATEST(0, COALESCE(balance_payable, 0) - ?),
           payment_status  = CASE
             WHEN GREATEST(0, COALESCE(balance_payable, 0) - ?) <= 0 THEN 'paid'
             ELSE 'partial'
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [Number(amount_paid), Number(amount_paid), Number(amount_paid), purchase_order_id],
    )

    await conn.commit()
    return { ok: true, id: result.insertId, voucher_number: voucherNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
