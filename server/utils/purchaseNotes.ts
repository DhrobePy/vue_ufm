/** Next adjustment-note number, legacy scheme: DAN-YYYY-NNNN (debit) / CAN-YYYY-NNNN (credit); the highest existing suffix + 1 (never COUNT). */
export async function nextNoteNumber(conn: any, noteType: 'debit' | 'credit'): Promise<string> {
  const prefix = noteType === 'debit' ? 'DAN' : 'CAN', year = new Date(Date.now() + 6 * 3600_000).getUTCFullYear()
  const [[last]] = await conn.query(`SELECT MAX(CAST(SUBSTRING_INDEX(note_number, '-', -1) AS UNSIGNED)) AS m FROM purchase_adjustment_notes WHERE note_number LIKE ?`, [`${prefix}-${year}-%`])
  return `${prefix}-${year}-${String((Number(last?.m) || 0) + 1).padStart(4, '0')}`
}
