import { query } from '~/server/utils/db'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'No form data' })

  const file = form.find(f => f.name === 'photo')
  if (!file || !file.data) throw createError({ statusCode: 400, statusMessage: 'No photo file' })

  // Validate type
  const mime = file.type ?? ''
  if (!mime.startsWith('image/')) throw createError({ statusCode: 400, statusMessage: 'File must be an image' })

  // Build filename: emp-{id}-{timestamp}.{ext}
  const ext = extname(file.filename ?? '.jpg') || '.jpg'
  const filename = `emp-${id}-${Date.now()}${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'photos')

  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

  // Delete old photo if it exists in our uploads folder
  try {
    const [existing] = await query('SELECT photo FROM hr_employees WHERE id = ?', [id]) as any[]
    if (existing?.photo?.startsWith('/uploads/photos/')) {
      const oldPath = join(process.cwd(), 'public', existing.photo)
      if (existsSync(oldPath)) await unlink(oldPath)
    }
  } catch {}

  await writeFile(join(uploadDir, filename), file.data)

  const photoUrl = `/uploads/photos/${filename}`
  await query('UPDATE hr_employees SET photo = ? WHERE id = ?', [photoUrl, id])

  return { ok: true, photo: photoUrl }
})
