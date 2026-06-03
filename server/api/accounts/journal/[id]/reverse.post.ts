import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { reason } = body ?? {}
  const session = await getUserSession(event)
  const userId = session?.user?.id ?? 1

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const db = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Fetch original entry
    const [[je]] = await conn.query<any>(
      `SELECT id, description, transaction_date, is_reversed FROM journal_entries WHERE id = ?`, [id]
    )
    if (!je) throw createError({ statusCode: 404, statusMessage: 'Journal entry not found' })
    if (je.is_reversed) throw createError({ statusCode: 400, statusMessage: 'This entry is already reversed' })

    // Fetch original lines
    const [lines] = await conn.query<any>(
      `SELECT account_id, debit_amount, credit_amount, description FROM transaction_lines WHERE journal_entry_id = ?`, [id]
    )

    // Create reversal entry
    const [rev] = await conn.query<any>(
      `INSERT INTO journal_entries (transaction_date, description, reverses_entry_id, related_document_type, created_by_user_id)
       VALUES (CURDATE(), ?, ?, 'ManualReversal', ?)`,
      [`REVERSAL: ${je.description}${reason ? ' — ' + reason : ''}`.slice(0, 255), id, userId]
    )
    const revId = rev.insertId

    // Insert reversed lines (swap DR/CR)
    for (const line of lines as any[]) {
      await conn.query(
        `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [revId, line.account_id, Number(line.credit_amount), Number(line.debit_amount), line.description]
      )
    }

    // Mark original as reversed
    await conn.query(
      `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
      [revId, id]
    )

    await auditLog(conn, {
      userId, action: 'cancelled', module: 'accounts', recordType: 'journal_entry',
      recordId: id, referenceNumber: `JE-${id}`,
      description: `Journal entry JE-${id} reversed by user ${userId}${reason ? ': ' + reason : ''}`,
      severity: 'warning',
    })

    await conn.commit()
    return { ok: true, reversalId: revId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
