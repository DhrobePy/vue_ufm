import { Z as defineEventHandler, a3 as dhakaToday, bU as scopedHealth, aW as nextActions, bn as query, k as DISTRICT_CENTRE } from '../../../nitro/nitro.mjs';
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

const centre = (d) => {
  var _a;
  return (_a = DISTRICT_CENTRE[d]) != null ? _a : null;
};
const route_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const today = dhakaToday(), rows = await scopedHealth(event);
  const acts = await nextActions(rows, { limit: 60 });
  const pins = /* @__PURE__ */ new Map();
  try {
    for (const r of await query(`SELECT id, lat, lon FROM customers WHERE lat IS NOT NULL AND lon IS NOT NULL`)) pins.set(`customer:${r.id}`, [Number(r.lat), Number(r.lon)]);
    for (const r of await query(`SELECT id, lat, lon FROM crm_prospects WHERE lat IS NOT NULL AND lon IS NOT NULL`)) pins.set(`prospect:${r.id}`, [Number(r.lat), Number(r.lon)]);
  } catch {
  }
  const visitTasks = await query(`SELECT t.party_type, t.party_id, t.title, COALESCE(c.name, p.name) name, c.id cid, p.id pid, p.district pdistrict, p.stage FROM crm_tasks t LEFT JOIN customers c ON t.party_type = 'customer' AND c.id = t.party_id LEFT JOIN crm_prospects p ON t.party_type = 'prospect' AND p.id = t.party_id WHERE t.status = 'open' AND t.kind = 'visit' AND (t.due_date IS NULL OR t.due_date <= ?)`, [today]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const out = /* @__PURE__ */ new Map();
  const put = (type, id, name, district, reason, value, tag) => {
    var _a2, _b2;
    const key = `${type}:${id}`, exact = pins.get(key), c = exact != null ? exact : centre(district);
    const cur = out.get(key);
    if (cur) {
      cur.tags.push(tag);
      return;
    }
    out.set(key, { key, party_type: type, id, name, district, reason, value: Math.round(value), tags: [tag], lat: (_a2 = c == null ? void 0 : c[0]) != null ? _a2 : null, lon: (_b2 = c == null ? void 0 : c[1]) != null ? _b2 : null, exact: !!exact });
  };
  for (const t of visitTasks) {
    const r = t.party_type === "customer" ? byId.get(t.party_id) : null;
    put(t.party_type, t.party_id, (_a = t.name) != null ? _a : "\u2014", (_c = (_b = r == null ? void 0 : r.district) != null ? _b : t.pdistrict) != null ? _c : "Unknown", t.title, 0, "visit task");
  }
  for (const a of acts.actions) put(a.party_type, a.party_id, a.name, a.district, a.headline, a.value, a.type);
  const users = await query(`SELECT id, display_name FROM users WHERE status = 'active' ORDER BY display_name`);
  return {
    today,
    stops: [...out.values()],
    pinned: pins.size,
    users,
    starts: [{ key: "demra", label: "Demra mill", lat: 23.7186, lon: 90.4955 }, { key: "sirajganj", label: "Sirajganj mill", lat: 24.4534, lon: 89.7007 }]
  };
});

export { route_get as default };
//# sourceMappingURL=route.get.mjs.map
