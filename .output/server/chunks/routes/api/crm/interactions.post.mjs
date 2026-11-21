import { Z as defineEventHandler, Q as crmUser, bq as readBody, N as createError, V as customerHealth, bn as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const interactions_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const me = await crmUser(event), b = await readBody(event);
  const type = (b == null ? void 0 : b.party_type) === "prospect" ? "prospect" : "customer", pid = Number(b == null ? void 0 : b.party_id), summary = String((_a = b == null ? void 0 : b.summary) != null ? _a : "").trim().slice(0, 1e3);
  if (!pid || !summary) throw createError({ statusCode: 400, statusMessage: "party_id and summary are required" });
  const channel = ["call", "visit", "sms", "whatsapp", "email", "note"].includes(b == null ? void 0 : b.channel) ? b.channel : "note";
  const lat = Number(b == null ? void 0 : b.lat), lon = Number(b == null ? void 0 : b.lon), geo = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0);
  const label = type === "customer" ? (_c = (_b = (await customerHealth()).find((r2) => r2.id === pid)) == null ? void 0 : _b.label) != null ? _c : null : null;
  const cols = ["party_type", "party_id", "channel", "direction", "summary", "outcome", "user_id"], vals = [type, pid, channel, (b == null ? void 0 : b.direction) === "in" ? "in" : "out", summary, String((_d = b == null ? void 0 : b.outcome) != null ? _d : "").slice(0, 120) || null, me.id];
  let r;
  try {
    r = await query(`INSERT INTO crm_interactions (${[...cols, "label_at", "lat", "lon", "accuracy_m"].join(", ")}) VALUES (${[...cols, "x", "x", "x", "x"].map(() => "?").join(", ")})`, [...vals, label, geo ? lat : null, geo ? lon : null, geo ? Math.round(Number(b == null ? void 0 : b.accuracy_m)) || null : null]);
  } catch (e) {
    if ((e == null ? void 0 : e.errno) !== 1054) throw e;
    r = await query(`INSERT INTO crm_interactions (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
  }
  if (geo && (b == null ? void 0 : b.pin)) await query(`UPDATE ${type === "customer" ? "customers" : "crm_prospects"} SET lat = ?, lon = ? WHERE id = ?`, [lat, lon, pid]).catch(() => {
  });
  if (/^\d{4}-\d{2}-\d{2}$/.test(String((_e = b == null ? void 0 : b.follow_up_date) != null ? _e : "")))
    await query(
      `INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, pid, Number(b == null ? void 0 : b.promise_amount) > 0 ? "promise" : "follow_up", Number(b == null ? void 0 : b.promise_amount) > 0 ? `Promised \u09F3${Number(b.promise_amount).toLocaleString()} \u2014 check it arrived` : `Follow up: ${summary.slice(0, 120)}`, b.follow_up_date, Number(b == null ? void 0 : b.promise_amount) || null, me.id, me.id]
    );
  return { ok: true, id: r.insertId };
});

export { interactions_post as default };
//# sourceMappingURL=interactions.post.mjs.map
