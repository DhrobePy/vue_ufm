/**
 * Scheduled database backup — dumps this app's own database (mysqldump),
 * gzips it, uploads to Google Drive with a unique timestamped name, and
 * sends a Telegram notification either way. Triggered by
 * /api/cron/db-backup (a token-protected endpoint meant to be hit by a
 * cPanel Cron Job every 30 minutes), same pattern as
 * /api/cron/daily-digest + sendOwnerDigestNow().
 *
 * Reuses the SAME Google service-account credential the legacy PHP app's
 * backup system already uses (path supplied via NUXT_GOOGLE_SERVICE_ACCOUNT_JSON)
 * and the same Drive folder (NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID) — no new
 * Google Cloud project needed. Filenames are prefixed `vueapp-backup-` so
 * they're visually distinguishable from the legacy app's own backups
 * sitting in the same folder.
 */
import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { unlink, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { google } from 'googleapis'
import { sendTelegram } from '~/server/utils/telegram'

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function dumpAndGzip(config: { dbHost: string; dbPort: number; dbUser: string; dbPass: string; dbName: string }, destPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const dump = spawn('mysqldump', [
      '--no-defaults',
      `--host=${config.dbHost}`,
      `--port=${config.dbPort}`,
      `--user=${config.dbUser}`,
      `--password=${config.dbPass}`,
      '--single-transaction',
      '--quick',
      '--routines',
      config.dbName,
    ])
    const gzip = createGzip()
    const out = createWriteStream(destPath)

    let stderr = ''
    dump.stderr.on('data', (d) => { stderr += d.toString() })
    dump.on('error', reject)

    pipeline(dump.stdout, gzip, out).then(resolve).catch(reject)

    dump.on('close', (code) => {
      if (code !== 0) reject(new Error(`mysqldump exited ${code}: ${stderr.slice(0, 500)}`))
    })
  })
}

async function uploadToDrive(keyFile: string, folderId: string, localPath: string, driveName: string): Promise<{ id: string; webViewLink?: string }> {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.create({
    requestBody: { name: driveName, parents: [folderId] },
    media: { mimeType: 'application/gzip', body: createReadStream(localPath) },
    fields: 'id, webViewLink',
  })
  return { id: res.data.id!, webViewLink: res.data.webViewLink ?? undefined }
}

export async function runDbBackupNow(): Promise<{ ok: boolean; file?: string; sizeBytes?: number; error?: string }> {
  const config = useRuntimeConfig()
  const keyFile  = String(config.googleServiceAccountJson ?? '')
  const folderId = String(config.googleDriveBackupFolderId ?? '')

  if (!keyFile || !folderId) {
    const msg = 'DB backup skipped: NUXT_GOOGLE_SERVICE_ACCOUNT_JSON / NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID not configured'
    console.warn(`[db-backup] ${msg}`)
    return { ok: false, error: msg }
  }

  const ts = timestamp()
  const dbName = String(config.dbName ?? 'db')
  const fileName = `vueapp-backup-${dbName}-${ts}.sql.gz`
  const localPath = join(tmpdir(), fileName)
  const startedAt = Date.now()

  try {
    await dumpAndGzip({
      dbHost: String(config.dbHost), dbPort: Number(config.dbPort),
      dbUser: String(config.dbUser), dbPass: String(config.dbPass), dbName,
    }, localPath)

    const { size } = await stat(localPath)
    await uploadToDrive(keyFile, folderId, localPath, fileName)
    await unlink(localPath).catch(() => {})

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
    await sendTelegram(
      `💾 <b>Vue App DB Backup</b> — success\n` +
      `File: <code>${fileName}</code>\n` +
      `Size: ${formatBytes(size)} · ${seconds}s`,
      'backup',
    )
    return { ok: true, file: fileName, sizeBytes: size }
  } catch (e: any) {
    await unlink(localPath).catch(() => {})
    const errMsg = e?.message ?? String(e)
    console.error('[db-backup] failed:', errMsg)
    await sendTelegram(`🔴 <b>Vue App DB Backup</b> — FAILED\n<code>${errMsg.slice(0, 300)}</code>`, 'backup').catch(() => {})
    return { ok: false, error: errMsg }
  }
}
