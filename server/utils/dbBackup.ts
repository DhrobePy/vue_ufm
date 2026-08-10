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
 * Talks to the Google Drive REST API directly (plain fetch) instead of the
 * `googleapis` SDK — that package pulls in ~190 sub-dependencies, which blew
 * the host's npm install past its disk quota. This needs nothing beyond
 * Node core.
 *
 * Auth: uses the SAME OAuth2 refresh token the legacy PHP app's backup
 * system already has (a real Google account's token, minted once via the
 * standard installed-app consent flow) — NOT a service-account key. Google
 * service accounts have no storage quota of their own and can only write
 * into a Shared Drive; the existing backup folder
 * (NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID) is a regular Drive folder owned by a
 * real user, confirmed live by a 403 "Service Accounts do not have storage
 * quota" response when a service-account JWT was tried first. Refreshing an
 * access token from a long-lived refresh token (RFC 6749 §6) uploads as
 * that real, quota-having user instead. Filenames are prefixed
 * `vueapp-backup-` so they're visually distinguishable from the legacy
 * app's own backups sitting in the same folder.
 */
import { spawn } from 'node:child_process'
import { createGzip } from 'node:zlib'
import { PassThrough, Readable } from 'node:stream'
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

/** Exchange a long-lived OAuth2 refresh token for a short-lived Drive access token (RFC 6749 §6). */
async function getDriveAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
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
  oauth: { clientId: string; clientSecret: string; refreshToken: string }, folderId: string, driveName: string,
): Promise<{ id: string; sizeBytes: number }> {
  const accessToken = await getDriveAccessToken(oauth.clientId, oauth.clientSecret, oauth.refreshToken)

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
  const clientId     = String(config.googleOauthClientId ?? '')
  const clientSecret = String(config.googleOauthClientSecret ?? '')
  const refreshToken = String(config.googleOauthRefreshToken ?? '')
  const folderId     = String(config.googleDriveBackupFolderId ?? '')

  if (!clientId || !clientSecret || !refreshToken || !folderId) {
    const msg = 'DB backup skipped: NUXT_GOOGLE_OAUTH_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN / NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID not configured'
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
      { clientId, clientSecret, refreshToken }, folderId, fileName,
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
