/**
 * Scheduled database backup — streams `mysqldump | gzip` straight into a
 * Google Drive upload over HTTPS. Deliberately touches NO local disk at any
 * point (no temp file, not even briefly) — the host's cPanel account is on
 * a tight disk quota, so this pipes mysqldump's stdout through gzip and
 * directly into the outgoing multipart request body as a stream. Sends a
 * Telegram notification either way. Triggered by /api/cron/db-backup (a
 * token-protected endpoint meant to be hit by a cPanel Cron Job every 30
 * minutes), same pattern as /api/cron/daily-digest + sendOwnerDigestNow().
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
import { readFile } from 'node:fs/promises'
import { createGzip } from 'node:zlib'
import { PassThrough, Readable } from 'node:stream'
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

/**
 * Runs mysqldump, gzips its output, and streams the result straight into a
 * Drive multipart-upload request body — nothing ever touches local disk.
 * Resolves with the uploaded file id + byte count once Drive confirms it.
 */
async function streamBackupToDrive(
  dbConfig: { dbHost: string; dbPort: number; dbUser: string; dbPass: string; dbName: string },
  keyFile: string, folderId: string, driveName: string,
): Promise<{ id: string; sizeBytes: number }> {
  const accessToken = await getDriveAccessToken(keyFile)

  const dump = spawn('mysqldump', [
    '--no-defaults',
    `--host=${dbConfig.dbHost}`,
    `--port=${dbConfig.dbPort}`,
    `--user=${dbConfig.dbUser}`,
    `--password=${dbConfig.dbPass}`,
    '--single-transaction',
    '--quick',
    '--routines',
    dbConfig.dbName,
  ])
  let dumpStderr = ''
  dump.stderr.on('data', (d) => { dumpStderr += d.toString() })

  const gzip = createGzip()
  const boundary = `boundary-${Date.now()}`
  const metadata = JSON.stringify({ name: driveName, parents: [folderId] })
  const preamble = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: application/gzip\r\n\r\n`,
  )
  const epilogue = Buffer.from(`\r\n--${boundary}--`)

  const body = new PassThrough()
  let sizeBytes = 0
  body.write(preamble)

  dump.stdout.pipe(gzip)
  gzip.on('data', (chunk: Buffer) => { sizeBytes += chunk.length })
  gzip.pipe(body, { end: false })

  const failure = new Promise<never>((_, reject) => {
    dump.on('error', reject)
    gzip.on('error', reject)
    dump.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(`mysqldump exited ${code}: ${dumpStderr.slice(0, 500)}`)
        gzip.destroy(err)
        body.destroy(err)
        reject(err)
      }
    })
  })
  const gzipDone = new Promise<void>((resolve, reject) => {
    gzip.on('end', () => { body.end(epilogue); resolve() })
    gzip.on('error', reject)
  })

  const uploadPromise = fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      // @ts-expect-error - Node's fetch (undici) accepts a web ReadableStream body with duplex:'half'
      body: Readable.toWeb(body),
      duplex: 'half',
    },
  ).then(async (res) => {
    if (!res.ok) throw new Error(`Drive upload failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
    return await res.json() as { id: string }
  })

  const [, result] = await Promise.all([
    Promise.race([gzipDone, failure]),
    Promise.race([uploadPromise, failure]),
  ])
  return { id: (result as { id: string }).id, sizeBytes }
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
  const startedAt = Date.now()

  try {
    const { sizeBytes } = await streamBackupToDrive(
      { dbHost: String(config.dbHost), dbPort: Number(config.dbPort), dbUser: String(config.dbUser), dbPass: String(config.dbPass), dbName },
      keyFile, folderId, fileName,
    )

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
    await sendTelegram(
      `💾 <b>Vue App DB Backup</b> — success\n` +
      `File: <code>${fileName}</code>\n` +
      `Size: ${formatBytes(sizeBytes)} · ${seconds}s`,
      'backup',
    )
    return { ok: true, file: fileName, sizeBytes }
  } catch (e: any) {
    const errMsg = e?.message ?? String(e)
    console.error('[db-backup] failed:', errMsg)
    await sendTelegram(`🔴 <b>Vue App DB Backup</b> — FAILED\n<code>${errMsg.slice(0, 300)}</code>`, 'backup').catch(() => {})
    return { ok: false, error: errMsg }
  }
}
