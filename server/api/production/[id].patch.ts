import { query } from '~/server/utils/db'

const UI_TO_DB: Record<string, string> = {
  running:   'in_progress',
  paused:    'delayed',
  completed: 'completed',
  cancelled: 'delayed',
  pending:   'pending',
}

export default defineEventHandler(async (event) => {
  const rawId     = (event.context.params?.id as string) || ''
  const numericId = Number(rawId.replace(/^PS-/i, ''))
  if (!numericId) throw createError({ statusCode: 400, statusMessage: 'Invalid production ID' })

  const body   = await readBody(event)
  const { status, notes } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (status) {
    const dbStatus = UI_TO_DB[status] ?? status
    sets.push('status = ?')
    params.push(dbStatus)

    if (status === 'running') {
      sets.push('production_started_at = COALESCE(production_started_at, NOW())')
    }
    if (status === 'completed') {
      sets.push('production_completed_at = NOW()')
    }
  }

  if (notes !== undefined) {
    sets.push('notes = ?')
    params.push(notes)
  }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  sets.push('updated_at = NOW()')
  params.push(numericId)

  await query(
    `UPDATE production_schedule SET ${sets.join(', ')} WHERE id = ?`,
    params,
  )

  return { ok: true }
})
