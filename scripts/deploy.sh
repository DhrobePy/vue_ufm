#!/usr/bin/env bash
# One-command deploy for cerp.ujjalfm.com — builds, commits, pushes, pulls on the
# server, restarts the Node app, kills leftover workers, and checks the result.
#
#   scripts/deploy.sh "what changed"          # full deploy
#   scripts/deploy.sh --check                 # build + checks only, touches nothing
#
# Encodes the hard-won rules from earlier deploys:
#  * `touch tmp/restart.txt` is NOT reliable — restart goes through cloudlinux-selector
#  * "restart: success" does NOT mean the old workers died — kill any process older
#    than the restart, then confirm what is left
#  * 200 on "/" proves little — also hit a login POST (must answer 401, not 5xx)
set -euo pipefail
cd "$(dirname "$0")/.."

KEY="${DEPLOY_KEY:-$HOME/.ssh/ujjalfm_cpanel_deploy_key2}"
HOST="${DEPLOY_HOST:-ujjalfmc@151.158.44.77}"
APP="${DEPLOY_APP:-/home/ujjalfmc/public_html/cerp.ujjalfm.com/vue_ufm}"
URL="${DEPLOY_URL:-https://cerp.ujjalfm.com}"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=15)

say() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }
die() { printf '\n\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

MODE="deploy"; MSG=""
case "${1:-}" in
  --check) MODE="check" ;;
  ""|-h|--help) sed -n '2,13p' "$0"; exit 0 ;;
  *) MSG="$1" ;;
esac

say "Build"
npx nuxt build >/tmp/deploy-build.log 2>&1 || { tail -30 /tmp/deploy-build.log; die "Build failed — nothing was changed."; }
grep -q "Build complete" /tmp/deploy-build.log || die "Build did not finish cleanly — see /tmp/deploy-build.log"
echo "build ok"

[ "$MODE" = "check" ] && { echo; echo "Check passed. Nothing committed or deployed."; exit 0; }

say "Commit and push"
[ "$(git branch --show-current)" = "main" ] || die "Not on main branch."
git add -A -- . ':!.claude'
if git diff --cached --quiet; then echo "nothing new to commit"; else git commit -q -m "$MSG"; fi
git push -q origin main
echo "pushed $(git rev-parse --short HEAD)"

say "Server: pull, restart, clean up workers"
"${SSH[@]}" "$HOST" "bash -s" "$APP" "$URL" <<'REMOTE' 2>&1 | grep -v "post-quantum\|store now\|openssh.com/pq"
set -euo pipefail
APP="$1"; URL="$2"
cd "$APP"
git pull -q --ff-only
echo "server at $(git rev-parse --short HEAD)"

T0=$(date +%s)
/usr/sbin/cloudlinux-selector restart --json --interpreter nodejs --user ujjalfmc --app-root "$APP" | tr -d '\n' | cut -c1-120; echo
sleep 2
curl -s -o /dev/null "$URL/auth/login"        # workers spawn on first request
sleep 3

# Any worker that started before the restart is stale (still serving old chunks).
for pid in $(ps -eo pid,etimes,cmd | awk -v t0="$T0" -v now="$(date +%s)" '/lsnode:.*vue_ufm/ && !/awk/ { if (now - $2 < t0) print $1 }'); do
  echo "killing stale worker $pid"; kill -9 "$pid" || true
done
sleep 1
curl -s -o /dev/null "$URL/auth/login"
sleep 2
echo "workers now:"; (ps -eo pid,lstart,cmd | grep "lsnode:.*vue_ufm" | grep -v grep | cut -c1-90) || true
REMOTE

say "Verify live site"
code_login=$(curl -s -o /dev/null -w '%{http_code}' "$URL/auth/login")
code_api=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/api/auth/login" -H 'content-type: application/json' -d '{"email":"deploy-check@invalid","password":"x"}')
echo "GET  /auth/login        -> $code_login   (want 200)"
echo "POST /api/auth/login    -> $code_api   (want 401)"
[ "$code_login" = "200" ] && [ "$code_api" = "401" ] || die "Live site check failed — investigate before telling anyone it is deployed."

say "Deployed ✔  (no database work needed unless the change notes say otherwise)"
