import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { device_id } = await readBody(event)
  if (!device_id) return { success: false, message: 'No device ID' }

  const branch = await queryOne(
    'SELECT id, name, address AS location FROM branches WHERE id = ?',
    [parseInt(device_id)]
  ) as any

  if (!branch) return { success: false, message: 'Unknown branch/device' }
  return { success: true, branch }
})
