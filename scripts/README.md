# Handling the ERP — the few commands you need

Run these from the project folder. Everything here is safe by default.

| I want to… | Command |
|---|---|
| Put my changes live | `npm run deploy -- "short note of what changed"` |
| Check my changes build, without deploying | `npm run deploy -- --check` |
| Find pages/APIs that crash | `npm run crawl -- http://127.0.0.1:3100 "<session cookie>"` |
| Type-check the server code | `npm run typecheck` |
| Catch up Vue's data from the old (legacy) system | `npm run sync:legacy` (preview) then `npm run sync:legacy -- --apply` |

## Deploy
`npm run deploy -- "note"` builds the app, commits, pushes, pulls on the server,
restarts it the reliable way, **kills leftover old workers**, and checks the live
site (login page must answer 200, a wrong-password login must answer 401). If any
step fails it stops and says so. No database work is ever needed — the app
creates/updates its own tables on start.

## Error sweep (`crawl`)
Opens every read-only page API and reports any that crash (HTTP 5xx). It only ever
reads. Start the built app locally (`node .output/server/index.mjs`) against the
database, then run it with a logged-in session cookie. Run it before a deploy.

## Legacy → Vue sync
Copies new customers, orders, ledger, GL, purchases and expenses from the old
system into Vue. **Always run the preview first** (no `--apply`) and read the
table it prints. Needs `scripts/.env.sync` (copy `scripts/.env.sync.example`; it is
git-ignored — never commit it) and an open SSH tunnel to the database, explained at
the top of `sync-legacy-transactional.mjs`. Existing Vue rows are never changed.

## Rules of thumb
- Passwords/keys live only in `.env` files on your machine and the server — not in git.
- After any deploy, test the one thing you changed on the live site.
