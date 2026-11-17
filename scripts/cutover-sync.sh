#!/usr/bin/env bash
# FINAL CUTOVER SYNC — run once legacy is frozen (nobody entering data in it).
# Backs up the Vue database on the server (seconds), copies everything new from legacy, re-derives balances, and verifies parity.
#   scripts/cutover-sync.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . scripts/.env.sync; set +a
KEY="${DEPLOY_KEY:-$HOME/.ssh/ujjalfm_cpanel_deploy_key2}"; HOST="${DEPLOY_HOST:-ujjalfmc@151.158.44.77}"
say() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

say "Opening the secure tunnel to the database"
ssh -i "$KEY" -o ServerAliveInterval=20 -o ServerAliveCountMax=6 -o ExitOnForwardFailure=yes -L 3307:localhost:3306 "$HOST" -N & TUN=$!
trap 'kill $TUN 2>/dev/null || true' EXIT
sleep 6

say "Backup (dumped on the server, saved to ../backups)"
F="../backups/vue_db_before_cutover_$(date +%Y%m%d_%H%M).sql.gz"
ssh -i "$KEY" -o BatchMode=yes "$HOST" "read -r P; MYSQL_PWD=\$P mysqldump -u '$VUE_DB_USER' --single-transaction --quick --no-tablespaces '$VUE_DB_NAME' | gzip -c" <<< "$VUE_DB_PASS" 2>/dev/null > "$F"
gzip -t "$F" && echo "backup ok: $F ($(du -h "$F" | cut -f1))"

say "Master data (customers, products)";            node scripts/sync-legacy-master.mjs --apply | grep -E "customers|products|Applied" || true
say "Users and limits";                               node scripts/sync-legacy-users.mjs --apply | sed -n '1,3p'
say "Transactions — pass 1";                          node scripts/sync-legacy-transactional.mjs --apply --catchup > /tmp/cutover-1.log 2>&1 && echo ok || { tail -5 /tmp/cutover-1.log; exit 1; }
say "Transactions — pass 2 (picks up anything skipped in pass 1)"; node scripts/sync-legacy-transactional.mjs --apply --catchup --force > /tmp/cutover-2.log 2>&1 && echo ok || { tail -5 /tmp/cutover-2.log; exit 1; }
say "Edits made in legacy since the rows were first copied (credit limits, approvals, bank rows…)"; node scripts/catchup-edits.mjs --apply | sed -n '1,12p'
say "Timestamps (repairs any 6-hour shift)";       node scripts/fix-synced-timestamps.mjs --apply | head -1
say "History (audit logs, QR logs, production, loans)"; node scripts/sync-legacy-history.mjs --apply | sed -n '3,14p'
say "Customer balances from the ledger";              node scripts/reconcile-customer-balances.mjs --apply | tail -1
say "Parity check against legacy";                    node scripts/verify-parity.mjs
