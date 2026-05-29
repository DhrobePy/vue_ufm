import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    transaction_date,
    description,
    entry_type = 'general',
    lines = [],
  } = body ?? {}

  if (!transaction_date || !description)
    throw createError({ statusCode: 400, statusMessage: 'transaction_date and description are required' })

  if (!Array.isArray(lines) || lines.length < 2)
    throw createError({ statusCode: 400, statusMessage: 'At least two journal lines are required' })

  // Validate balance
  const totalDebits  = lines.reduce((s: number, l: any) => s + Number(l.debit_amount  || 0), 0)
  const totalCredits = lines.reduce((s: number, l: any) => s + Number(l.credit_amount || 0), 0)
  if (Math.abs(totalDebits - totalCredits) > 0.01)
    throw createError({ statusCode: 400, statusMessage: `Journal entry does not balance: debits=${totalDebits} credits=${totalCredits}` })

  if (totalDebits <= 0)
    throw createError({ statusCode: 400, statusMessage: 'Journal entry must have at least one non-zero amount' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.query<any>(
      `INSERT INTO journal_entries
         (transaction_date, description, related_document_type, created_by_user_id)
       VALUES (?, ?, ?, ?)`,
      [transaction_date, description, 'GeneralTransaction', userId],
    )
    const entryId = result.insertId

    for (const line of lines) {
      await conn.query(
        `INSERT INTO transaction_lines
           (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          entryId,
          Number(line.account_id),
          Number(line.debit_amount  || 0),
          Number(line.credit_amount || 0),
          line.description || null,
        ],
      )
    }

    await conn.commit()
    return { ok: true, id: entryId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
