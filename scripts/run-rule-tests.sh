#!/usr/bin/env bash
# Runs scripts/rule-tests.mjs against a throw-away MariaDB on port 3390 — NEVER production.
#
# One-time setup (schema only, no data):
#   1. mariadb-install-db --datadir=/tmp/scratch/data && mariadbd --datadir=/tmp/scratch/data --port=3390 --bind-address=127.0.0.1 &
#   2. mysqldump --no-data <live-vue-db> > /tmp/scratch/schema.sql      (through the SSH tunnel)
#   3. mysql -h127.0.0.1 -P3390 -uroot -e "create user 'tst'@'127.0.0.1' identified by 'tstpw'; create user 'tst'@'localhost' identified by 'tstpw'"
# Then, after `npx nuxt build`:   scripts/run-rule-tests.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SCRATCH="${SCRATCH_DIR:-/tmp/scratch}"
pkill -f "output/server/index.mjs" || true
mysql -h127.0.0.1 -P3390 -uroot -e "drop database if exists scratch_vue; create database scratch_vue character set utf8mb4; grant all on scratch_vue.* to 'tst'@'localhost'; grant all on scratch_vue.* to 'tst'@'127.0.0.1'" 2>/dev/null
(echo "SET FOREIGN_KEY_CHECKS=0;"; cat "$SCRATCH/schema.sql") | mysql -h127.0.0.1 -P3390 -uroot scratch_vue 2>/dev/null
mysql -h127.0.0.1 -P3390 -uroot scratch_vue < scripts/rule-tests.seed.sql 2>/dev/null
export SESSION_PW="$(openssl rand -hex 24)"
NITRO_PORT=3100 NUXT_SESSION_PASSWORD="$SESSION_PW" NUXT_DB_HOST=127.0.0.1 NUXT_DB_PORT=3390 NUXT_DB_USER=tst NUXT_DB_PASS=tstpw NUXT_DB_NAME=scratch_vue \
  nohup node .output/server/index.mjs >"$SCRATCH/app.log" 2>&1 &
for _ in $(seq 60); do grep -q "migrations complete" "$SCRATCH/app.log" && break; sleep 1; done
set +e
BASE=http://127.0.0.1:3100 DB_PORT=3390 node scripts/rule-tests.mjs; rc=$?
pkill -f "output/server/index.mjs" || true
exit $rc
