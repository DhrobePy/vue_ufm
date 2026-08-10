/**
 * Scheduled database backup — dumps this app's own database (mysqldump),
 * gzips it, uploads to Google Drive with a unique timestamped name, and
 * sends a Telegram notification either way. Triggered by
 * /api/cron/db-backup (a token-protected endpoint meant to be hit by a
 * cPanel Cron Job every 30 minutes), same pattern as
 * /api/cron/daily-digest + sendOwnerDigestNow().
 *
 * Talks to the Google Drive REST API directly (service-account JWT signed
 * with Node's built-in crypto + plain fetch) instead of the `googleapis`
 * SDK — that package pulls in ~190 sub-dependencies, which blew the host's
 * npm install past its disk quota. This needs nothing beyond Node core.
 *
 * Reuses the SAME Google service-account credential the legacy PHP app's
 * backup system already uses (path supplied via NUXT_GOOGLE_SERVICE_ACCOUNT_JSON)
 * and the same Drive folder (NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID) — no new
 * Google Cloud project needed. Filenames are prefixed `vueapp-backup-` so
 * they're visually distinguishable from the legacy app's own backups
 * sitting in the same folder.
 */
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { readFile, unlink, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { createSign } from 'node:crypto'
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

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Mint a short-lived Drive-scoped access token from a service-account key file (RFC 7523 JWT-bearer flow). */
async function getDriveAccessToken(keyFile: string): Promise<string> {
  const raw = await readFile(keyFile, 'utf8')
  const key = JSON.parse(raw) as { client_email: string; private_key: string }

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${payload}`)
  const signature = base64url(signer.sign(key.private_key))
  const jwt = `${header}.${payload}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) throw new Error(`Drive auth failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function uploadToDrive(keyFile: string, folderId: string, localPath: string, driveName: string): Promise<{ id: string }> {
  const accessToken = await getDriveAccessToken(keyFile)
  const fileBuffer = await readFile(localPath)

  const boundary = `boundary-${Date.now()}`
  const metadata = JSON.stringify({ name: driveName, parents: [folderId] })
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/gzip\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`),
  ])

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })
  if (!res.ok) throw new Error(`Drive upload failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  return await res.json() as { id: string }
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
