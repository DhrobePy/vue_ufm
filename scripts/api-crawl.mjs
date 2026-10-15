#!/usr/bin/env node
/**
 * Read-only error sweep: calls every GET endpoint ([id] routes probed with id 1) under
 * server/api and reports any that answer 5xx (a crash) — 4xx is fine
 * (validation / permission), it means the handler ran and decided.
 *
 *   node scripts/api-crawl.mjs http://127.0.0.1:3100 "<session cookie>"
 *
 * Needs an authenticated session cookie (copy the `nuxt-session` cookie from
 * a logged-in browser). GET only — never writes. Skips handlers whose GET has
 * side effects (cron, device ingest) and file exports.
 */
import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const [base, cookie] = [process.argv[2], process.argv[3]]
if (!base || !cookie) {
  console.error('usage: node scripts/api-crawl.mjs <base-url> "<nuxt-session cookie value>"')
  process.exit(2)
}

const SKIP = /^(cron|device)\/|\/export\/|\.csv$|telegram|backup|digest|print|pdf/
const root = new URL('../server/api', import.meta.url).pathname

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const routes = walk(root)
  .map((p) => relative(root, p).split(sep).join('/'))
  .filter((p) => p.endsWith('.get.ts'))
  .map((p) => p.replace(/\.get\.ts$/, '').replace(/\/index$/, ''))
  // [id]-style routes are probed with id 1: a 404/400 is fine, a 5xx means the
  // SQL itself is broken (it runs before the not-found check).
  .map((p) => ({ path: p, url: p.replace(/\[[^\]]+\]/g, '1') }))
  .filter((r) => !SKIP.test(r.path))
  .sort((a, b) => a.path.localeCompare(b.path))

const bad = []
let ok = 0
for (const { path: r, url } of routes) {
  try {
    const res = await fetch(`${base}/api/${url}`, { headers: { cookie: `nuxt-session=${cookie}` } })
    if (res.status >= 500) {
      const body = (await res.text()).slice(0, 200).replace(/\s+/g, ' ')
      bad.push(`${res.status}  /api/${r}  ${body}`)
    } else ok++
  } catch (e) {
    bad.push(`ERR  /api/${r}  ${e.message}`)
  }
}

console.log(`${routes.length} endpoints checked — ${ok} ok, ${bad.length} crashed`)
for (const b of bad) console.log('  ' + b)
process.exit(bad.length ? 1 : 0)
