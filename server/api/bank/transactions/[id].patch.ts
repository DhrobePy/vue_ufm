import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event) as {
    action: 'approve' | 'reject' | 'unpost' | 'update'
    notes?: string
    description?: string
    amount?: number
    reference_number?: string
    cheque_number?: string
    payee_payer_name?: string
    special_note?: string
    transaction_date?: string
  }
  const { action } = body

  if (!['approve', 'reject', 'unpost', 'update'].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid action' })
  }

  const session = await getUserSession(event)
  const userId  = (session?.user as any)?.id   ?? 1
  const userName = (session?.user as any)?.name ?? 'System'
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  const isAdmin = ['admin', 'superadmin'].includes(role)
  const ip      = getRequestIP(event) ?? null

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[txn]] = await conn.query<any>(
      `SELECT t.* FROM bank_transactions t WHERE t.id = ?`, [id],
    )
    if (!txn) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })

    // ── UNPOST ──────────────────────────────────────────────────────────────
    if (action === 'unpost') {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Only admin can unpost transactions' })
      if (txn.status === 'unposted') throw createError({ statusCode: 400, statusMessage: 'Transaction is already unposted' })
      const oldStatus = txn.status
      await conn.query(
        `UPDATE bank_transactions SET status = 'unposted', updated_at = NOW() WHERE id = ?`, [id],
      )
      await conn.query(
        `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
         VALUES (?, 'unposted', ?, ?, ?, ?, ?, ?)`,
        [id, userId, userName, ip,
          JSON.stringify({ status: oldStatus }),
          JSON.stringify({ status: 'unposted' }),
          body.notes || null],
      )
      await conn.commit()
      return { message: 'Transaction unposted successfully' }
    }

    // ── UPDATE (edit) ────────────────────────────────────────────────────────
    if (action === 'update') {
      if (!isAdmin && txn.status !== 'pending') {
        throw createError({ statusCode: 403, statusMessage: 'Only admin can edit non-pending transactions' })
      }
      const setParts: string[] = []
      const vals: any[]        = []
      const old: any = {}
      const nw: any  = {}

      if (body.description     !== undefined) { setParts.push('description = ?');     vals.push(body.description);     old.description = txn.description;     nw.description = body.description }
      if (body.amount          !== undefined) { setParts.push('amount = ?');           vals.push(body.amount);           old.amount = txn.amount;                   nw.amount = body.amount }
      if (body.reference_number !== undefined) { setParts.push('reference_number = ?'); vals.push(body.reference_number); old.reference_number = txn.reference_number; nw.reference_number = body.reference_number }
      if (body.cheque_number   !== undefined) { setParts.push('cheque_number = ?');   vals.push(body.cheque_number);   old.cheque_number = txn.cheque_number;       nw.cheque_number = body.cheque_number }
      if (body.payee_payer_name !== undefined) { setParts.push('payee_payer_name = ?'); vals.push(body.payee_payer_name); old.payee_payer_name = txn.payee_payer_name; nw.payee_payer_name = body.payee_payer_name }
      if (body.special_note    !== undefined) { setParts.push('special_note = ?');    vals.push(body.special_note);    old.special_note = txn.special_note;         nw.special_note = body.special_note }
      if (body.transaction_date !== undefined) { setParts.push('transaction_date = ?'); vals.push(body.transaction_date); old.transaction_date = txn.transaction_date; nw.transaction_date = body.transaction_date }

      if (setParts.length) {
        setParts.push('updated_at = NOW()')
        await conn.query(`UPDATE bank_transactions SET ${setParts.join(', ')} WHERE id = ?`, [...vals, id])
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values)
           VALUES (?, 'updated', ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip, JSON.stringify(old), JSON.stringify(nw)],
        )
      }
      await conn.commit()
      return { message: 'Transaction updated successfully' }
    }

    // ── APPROVE / REJECT ─────────────────────────────────────────────────────
    if (txn.status !== 'pending') {
      throw createError({ statusCode: 400, statusMessage: `Transaction is ${txn.status} — cannot ${action}` })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    await conn.query(
      `UPDATE bank_transactions
       SET status = ?, special_note = COALESCE(?, special_note), updated_at = NOW()
       WHERE id = ?`,
      [newStatus, body.notes || null, id],
    )
    await conn.query(
      `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, action === 'approve' ? 'approved' : 'rejected', userId, userName, ip,
        JSON.stringify({ status: 'pending' }),
        JSON.stringify({ status: newStatus }),
        body.notes || null],
    )
    await conn.commit()
    return { message: `Transaction ${action}d successfully` }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})
