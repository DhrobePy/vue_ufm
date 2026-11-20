#!/usr/bin/env bash
# Scheduled database backup — runs ON THE SERVER from cron (installed by scripts/install-backup-cron.sh).
#   hourly  : dump → gzip → verify → sha256        (keeps 48 hourly, 14 daily, 8 weekly, 12 monthly)
#   daily   : the first run after 02:00 Dhaka also pushes the file to Google Drive (existing app endpoint) — off-server copy
# Reads DB credentials from the apps' own config (never printed, never on a command line). Dumps are consistent
# (--single-transaction), low priority (nice/ionice), written 0600 outside the web root.
# Failure of any step → Telegram alert through the app (category "backup"). Success is silent except the daily Drive run.
set -uo pipefail
umask 077
DUMP=$(command -v mariadb-dump || command -v mysqldump); CLIENT=$(command -v mariadb || command -v mysql)

ROOT="${BACKUP_ROOT:-/home/ujjalfmc/db_backups}"
VUE_ENV="${VUE_ENV:-/home/ujjalfmc/public_html/cerp.ujjalfm.com/vue_ufm/.env}"
LEGACY_CFG="${LEGACY_CFG:-/home/ujjalfmc/public_html/saas.ujjalfm.com/core/config/config.php}"
LOCK="$ROOT/.lock"; LOG="$ROOT/backup.log"
mkdir -p "$ROOT"; exec 9>"$LOCK"; flock -n 9 || exit 0          # one run at a time
log() { printf '%s %s\n' "$(TZ=Asia/Dhaka date '+%F %T')" "$*" >> "$LOG"; }
[ "$(stat -c %s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ] && tail -n 2000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"

envv() { grep -m1 "^$1=" "$VUE_ENV" | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
phpv() { sed -nE "s/^define\('$1',\s*'([^']*)'\).*/\1/p" "$LEGACY_CFG" | head -1; }
alert() { # failure → Telegram via the app
  local tok; tok=$(envv NUXT_CRON_SECRET)
  [ -n "$tok" ] && curl -s -m 20 -G "https://cerp.ujjalfm.com/api/cron/backup-alert" --data-urlencode "token=$tok" --data-urlencode "msg=$1" >/dev/null 2>&1
  log "ALERT: $1"
}

dump() { # name host user pass db
  local name="$1" host="$2" user="$3" pass="$4" db="$5" dir="$ROOT/$1/hourly" stamp out
  [ -n "$user" ] && [ -n "$pass" ] && [ -n "$db" ] || { alert "$name backup skipped: credentials not found"; return 1; }
  mkdir -p "$dir"; stamp=$(TZ=Asia/Dhaka date +%Y%m%d_%H%M); out="$dir/${name}_${db}_${stamp}.sql.gz"
  if ! MYSQL_PWD="$pass" nice -n 15 ionice -c3 "$DUMP" -h "${host:-localhost}" -u "$user" --single-transaction --quick \
        --routines --triggers --events --default-character-set=utf8mb4 "$db" 2>>"$LOG" | gzip -6 > "$out.part"; then
    rm -f "$out.part"; alert "$name backup FAILED: mysqldump error (see backup.log)"; return 1
  fi
  mv "$out.part" "$out"
  # verify: gzip intact, dump finished ("Dump completed" footer), plausible size
  local size; size=$(stat -c %s "$out")
  if ! gzip -t "$out" 2>>"$LOG" || ! zcat "$out" | tail -c 400 | grep -q "Dump completed" || [ "$size" -lt 20000 ]; then
    mv "$out" "$out.BAD"; alert "$name backup FAILED verification ($size bytes) — kept as .BAD"; return 1
  fi
  ( cd "$dir" && sha256sum "$(basename "$out")" > "$(basename "$out").sha256" )
  log "$name ok: $(basename "$out") $(numfmt --to=iec "$size")"
  echo "$out"
}

prune() { # name — tiered retention from the hourly pool
  local n="$1" h="$ROOT/$1/hourly" d="$ROOT/$1/daily" w="$ROOT/$1/weekly" m="$ROOT/$1/monthly" f key
  mkdir -p "$d" "$w" "$m"
  for f in $(ls -1 "$h"/*.sql.gz 2>/dev/null); do          # promote the newest file of each day / ISO-week / month
    key=$(basename "$f" | grep -oE '[0-9]{8}' | tail -1)
    for t in "d:$d:${key}" "w:$w:$(date -d "${key:0:4}-${key:4:2}-${key:6:2}" +%G%V)" "m:$m:${key:0:6}"; do
      IFS=: read -r _ dir tag <<<"$t"
      cp -f "$f" "$dir/${n}_${tag}.sql.gz"; [ -f "$f.sha256" ] && sed "s#$(basename "$f")#${n}_${tag}.sql.gz#" "$f.sha256" > "$dir/${n}_${tag}.sql.gz.sha256"
    done
  done
  ls -1t "$h"/*.sql.gz 2>/dev/null | tail -n +49 | while read -r x; do rm -f "$x" "$x.sha256"; done
  ls -1t "$d"/*.sql.gz 2>/dev/null | tail -n +15 | while read -r x; do rm -f "$x" "$x.sha256"; done
  ls -1t "$w"/*.sql.gz 2>/dev/null | tail -n +9  | while read -r x; do rm -f "$x" "$x.sha256"; done
  ls -1t "$m"/*.sql.gz 2>/dev/null | tail -n +13 | while read -r x; do rm -f "$x" "$x.sha256"; done
}

# Admin → Settings → Maintenance switch (system_settings.backup_policy). If the database can't be asked, keep backing up.
paused=$(MYSQL_PWD="$(envv NUXT_DB_PASS)" "$CLIENT" -N -h "$(envv NUXT_DB_HOST)" -u "$(envv NUXT_DB_USER)" "$(envv NUXT_DB_NAME)" \
  -e "SELECT setting_value FROM system_settings WHERE setting_key='backup_policy'" 2>/dev/null | grep -c '"enabled": *false')
[ "$paused" -gt 0 ] && { log "paused by admin switch — skipped"; exit 0; }

vue_file=$(dump vue "$(envv NUXT_DB_HOST)" "$(envv NUXT_DB_USER)" "$(envv NUXT_DB_PASS)" "$(envv NUXT_DB_NAME)") && prune vue
dump legacy "$(phpv DB_HOST)" "$(phpv DB_USER)" "$(phpv DB_PASS)" "$(phpv DB_NAME)" >/dev/null && prune legacy

# Off-server copy once a day (first run after 02:00 Dhaka) — Vue DB via the app's Drive uploader
today=$(TZ=Asia/Dhaka date +%F); hr=$(TZ=Asia/Dhaka date +%H)
if [ "$hr" -ge 2 ] && [ "$(cat "$ROOT/.drive-last" 2>/dev/null)" != "$today" ]; then
  tok=$(envv NUXT_CRON_SECRET)
  res=$(curl -s -m 600 -G "https://cerp.ujjalfm.com/api/cron/db-backup" --data-urlencode "token=$tok")
  if echo "$res" | grep -q '"ok":true'; then echo "$today" > "$ROOT/.drive-last"; log "drive ok: $res"
  else  # alert once a day, not every hour
    [ "$(cat "$ROOT/.drive-alerted" 2>/dev/null)" != "$today" ] && { echo "$today" > "$ROOT/.drive-alerted"; alert "Drive upload FAILED (local backups are fine): ${res:0:160}"; }
    log "drive failed: ${res:0:200}"
  fi
fi
log "done (free: $(df -h "$ROOT" | awk 'NR==2{print $4}'))"
