/**
 * Recycle Bin engine (spec §2.11) — generic snapshot/restore for deletes.
 *
 * A "batch" is one delete operation (e.g. one order deletion). Inside it,
 * every row touched gets a full JSON snapshot in recycle_bin_items BEFORE
 * it's removed, in the same order the caller deletes things (children
 * first, then the parent last — the order FK constraints require anyway).
 * Restore replays those snapshots in reverse (id DESC): the parent goes
 * back first, then children, so every FK reference resolves.
 *
 * Usage inside a delete endpoint's transaction:
 *   const batchId = await recycleBegin(conn, { entityType: 'credit_order', label: order.order_number, customerId, userId, userName })
 *   await recycleArchiveDelete(conn, batchId, 'credit_order_items', 'order_id', id)
 *   ...(children first)...
 *   await recycleArchiveDelete(conn, batchId, 'credit_orders', 'id', id)
 *   await recycleFinalize(conn, batchId)
 */

/** MySQL DATETIME string using local (server) time components — avoids the
 *  UTC-shift bug of naively calling Date#toISOString() on a value mysql2
 *  already parsed as local time (DATETIME carries no timezone of its own). */
function mysqlDateTimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Exported for the rare delete endpoint that needs a compound WHERE
 *  recycleArchiveDelete's single-column signature can't express. */
export function serializeRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? mysqlDateTimeString(v) : v
  }
  return out
}

export async function recycleBegin(conn: any, opts: {
  entityType: string
  label: string
  customerId?: number | null
  userId: number
  userName: string
}): Promise<number> {
  const [res] = await conn.query(
    `INSERT INTO recycle_bin_batches
       (entity_type, label, customer_id, deleted_by_user_id, deleted_by_name)
     VALUES (?, ?, ?, ?, ?)`,
    [opts.entityType, opts.label.slice(0, 200), opts.customerId ?? null, opts.userId, opts.userName],
  )
  return res.insertId
}

/**
 * Snapshot every row matching `WHERE whereCol = whereVal` in `table`, then
 * delete them. Returns how many rows were archived (0 = nothing to do,
 * caller can skip the DELETE entirely).
 */
export async function recycleArchiveDelete(
  conn: any, batchId: number, table: string, whereCol: string, whereVal: any, pkCol = 'id',
): Promise<number> {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal])
  if (!rows.length) return 0

  for (const row of rows) {
    await conn.query(
      `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
       VALUES (?, ?, 'delete', ?, ?, ?)`,
      [batchId, table, pkCol, String(row[pkCol]), JSON.stringify(serializeRow(row))],
    )
  }
  await conn.query(`DELETE FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal])
  return rows.length
}

/**
 * Snapshot a row that's about to be UPDATED in place (not deleted) — restore
 * rewinds it back to this snapshot. Caller performs the UPDATE afterward.
 */
export async function recycleSnapshotBefore(
  conn: any, batchId: number, table: string, whereCol: string, whereVal: any, pkCol = 'id',
): Promise<number> {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal])
  for (const row of rows) {
    await conn.query(
      `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
       VALUES (?, ?, 'update', ?, ?, ?)`,
      [batchId, table, pkCol, String(row[pkCol]), JSON.stringify(serializeRow(row))],
    )
  }
  return rows.length
}

export async function recycleFinalize(conn: any, batchId: number): Promise<void> {
  await conn.query(
    `UPDATE recycle_bin_batches
     SET item_count = (SELECT COUNT(*) FROM recycle_bin_items WHERE batch_id = ?)
     WHERE id = ?`,
    [batchId, batchId],
  )
}

/**
 * Restore a batch: replays every captured row in reverse capture order
 * (id DESC — parent rows were captured last, so they go back first),
 * re-inserting 'delete' items and rewinding 'update' items to their
 * pre-change snapshot. Runs in its own transaction; throws (and rolls
 * back cleanly) on the first failure rather than partially restoring.
 */
export async function recycleRestore(getDb: () => any, batchId: number, userId: number): Promise<{ restored: number }> {
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[batch]] = await conn.query(`SELECT * FROM recycle_bin_batches WHERE id = ? FOR UPDATE`, [batchId])
    if (!batch) throw createError({ statusCode: 404, statusMessage: 'Recycle bin batch not found' })
    if (batch.status !== 'active') throw createError({ statusCode: 409, statusMessage: `This batch is already ${batch.status}` })

    const [items] = await conn.query(
      `SELECT * FROM recycle_bin_items WHERE batch_id = ? ORDER BY id DESC`, [batchId],
    )

    for (const item of items) {
      const snapshot = JSON.parse(item.snapshot_json)
      if (item.op === 'delete') {
        const cols = Object.keys(snapshot)
        const placeholders = cols.map(() => '?').join(', ')
        const colList = cols.map(c => `\`${c}\``).join(', ')
        await conn.query(
          `INSERT INTO \`${item.table_name}\` (${colList}) VALUES (${placeholders})`,
          cols.map(c => snapshot[c]),
        )
      } else {
        const cols = Object.keys(snapshot).filter(c => c !== item.row_pk_col)
        const setClause = cols.map(c => `\`${c}\` = ?`).join(', ')
        await conn.query(
          `UPDATE \`${item.table_name}\` SET ${setClause} WHERE \`${item.row_pk_col}\` = ?`,
          [...cols.map(c => snapshot[c]), item.row_pk_val],
        )
      }
    }

    await conn.query(
      `UPDATE recycle_bin_batches SET status = 'restored', restored_by_user_id = ?, restored_at = NOW() WHERE id = ?`,
      [userId, batchId],
    )

    await conn.commit()
    return { restored: items.length }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

/** Permanently forget a batch — the snapshot rows themselves are deleted. */
export async function recyclePurge(getDb: () => any, batchId: number, userId: number): Promise<void> {
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[batch]] = await conn.query(`SELECT status FROM recycle_bin_batches WHERE id = ? FOR UPDATE`, [batchId])
    if (!batch) throw createError({ statusCode: 404, statusMessage: 'Recycle bin batch not found' })
    if (batch.status === 'purged') throw createError({ statusCode: 409, statusMessage: 'Already purged' })

    await conn.query(`DELETE FROM recycle_bin_items WHERE batch_id = ?`, [batchId])
    await conn.query(
      `UPDATE recycle_bin_batches SET status = 'purged', purged_by_user_id = ?, purged_at = NOW() WHERE id = ?`,
      [userId, batchId],
    )
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}
