import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { requireAction } from '~/server/utils/permissions'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * POST /api/ledger/review   { ids: number[], action: 'keep' | 'delete', note?: string }
 * Decide flagged ledger lines (review_status = 'review' only — lines that legacy itself holds are never deletable here).
 *  keep   → the line stays and is marked reviewed.
 *  delete → the line (and its journal entry, when no other line uses it) moves to the Recycle Bin as ONE restorable batch,
 *           and each affected customer's stored balance is re-derived from the ledger.
 */
export default defineEventHandler(async (event) => {
  const { userId } = await requireAction(event, { module: 'customers', page: 'list', action: 'review_ledger', roleFallback: [], explicit: true },
    'Only admin, or a user granted "Review Ledger Lines", may decide ledger lines')
  const session = await getUserSession(event)
  const userName = String(session?.user?.name ?? `User ${userId}`)
  const body = await readBody(event)
  const ids: number[] = [...new Set<number>((Array.isArray(body?.ids) ? body.ids : []).map(Number).filter(Boolean))]
  const action = String(body?.action ?? '')
  const note = String(body?.note ?? '').trim().slice(0, 255)
  if (!ids.length || ids.length > 500) throw createError({ statusCode: 400, statusMessage: 'Choose between 1 and 500 lines' })
  if (!['keep', 'delete'].includes(action)) throw createError({ statusCode: 400, statusMessage: 'action must be keep or delete' })
  if (action === 'delete' && note.length < 3) throw createError({ statusCode: 400, statusMessage: 'Please give a short reason for deleting' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [lines] = await conn.query<any>(`SELECT * FROM customer_ledger WHERE id IN (?) FOR UPDATE`, [ids])
    const notReviewable = lines.filter((l: any) => l.review_status !== 'review')
    if (lines.length !== ids.length || notReviewable.length)
      throw createError({ statusCode: 409, statusMessage: `${ids.length - lines.length + notReviewable.length} of the chosen lines are not waiting for review (already decided, or not flagged)` })

    if (action === 'keep') {
      await conn.query(`UPDATE customer_ledger SET review_status = 'kept', reviewed_by_user_id = ?, reviewed_at = NOW(), review_note = ? WHERE id IN (?)`, [userId, note || null, ids])
      await auditLog(conn, { userId, action: 'other', module: 'customers', recordType: 'customer_ledger', recordId: ids[0],
        description: `Ledger review: kept ${ids.length} line(s)${note ? ` — ${note}` : ''}` })
      await conn.commit()
      return { ok: true, kept: ids.length }
    }

    const customerIds: number[] = [...new Set<number>(lines.map((l: any) => Number(l.customer_id)))]
    const batch = await recycleBegin(conn, { entityType: 'ledger_review_delete', label: `Ledger review — ${ids.length} line(s) deleted: ${note}`, customerId: customerIds.length === 1 ? customerIds[0] : null, userId, userName })
    let jeRemoved = 0
    for (const l of lines) {
      const je = l.journal_entry_id ? Number(l.journal_entry_id) : null
      await recycleArchiveDelete(conn, batch, 'customer_ledger', 'id', l.id)
      if (je) {
        const [[other]] = await conn.query<any>(`SELECT COUNT(*) n FROM customer_ledger WHERE journal_entry_id = ?`, [je])
        const [[pay]] = await conn.query<any>(`SELECT COUNT(*) n FROM customer_payments WHERE journal_entry_id = ?`, [je]).catch(() => [[{ n: 0 }]])
        if (!Number(other.n) && !Number(pay.n)) {          // nothing else leans on this journal entry
          await recycleArchiveDelete(conn, batch, 'transaction_lines', 'journal_entry_id', je)
          await recycleArchiveDelete(conn, batch, 'journal_entries', 'id', je)
          jeRemoved++
        }
      }
    }
    await conn.query(
      `UPDATE customers c LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger WHERE customer_id IN (?) GROUP BY customer_id) l ON l.customer_id = c.id
       SET c.current_balance = COALESCE(l.b, 0), c.updated_at = NOW() WHERE c.id IN (?)`, [customerIds, customerIds])
    await recycleFinalize(conn, batch)
    await auditLog(conn, { userId, action: 'deleted', module: 'customers', recordType: 'customer_ledger', recordId: ids[0], severity: 'warning',
      description: `Ledger review: deleted ${ids.length} line(s) (${jeRemoved} journal entries) → Recycle Bin batch #${batch} — ${note}` })
    await conn.commit()
    return { ok: true, deleted: ids.length, journalEntriesRemoved: jeRemoved, recycleBatch: batch }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
