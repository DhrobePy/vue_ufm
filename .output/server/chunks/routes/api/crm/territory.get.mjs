import { Z as defineEventHandler, bR as scopedHealth, a3 as dhakaToday, bl as query } from '../../../nitro/nitro.mjs';
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

const territory_get = defineEventHandler(async (event) => {
  var _a;
  const rows = await scopedHealth(event), today = dhakaToday();
  const touched = new Set((await query(`SELECT DISTINCT party_id FROM crm_interactions WHERE party_type = 'customer' AND channel <> 'note' AND direction = 'out' AND created_at >= DATE_SUB(?, INTERVAL 60 DAY)`, [today])).map((r) => r.party_id));
  const users = new Map((await query(`SELECT id, display_name FROM users`)).map((u) => [u.id, u.display_name]));
  const total = rows.reduce((t, r) => t + r.value_12m, 0), groups = /* @__PURE__ */ new Map();
  for (const r of rows) ((_a = groups.get(r.district)) != null ? _a : groups.set(r.district, []).get(r.district)).push(r);
  const districts = [...groups].map(([district, rs]) => {
    var _a2, _b;
    const buyers = rs.filter((r) => r.value_12m > 0), owners = /* @__PURE__ */ new Map();
    for (const r of rs) {
      const o = r.owner_user_id ? (_a2 = users.get(r.owner_user_id)) != null ? _a2 : `user ${r.owner_user_id}` : "unassigned";
      owners.set(o, ((_b = owners.get(o)) != null ? _b : 0) + 1);
    }
    const value = buyers.reduce((t, r) => t + r.value_12m, 0);
    return {
      district,
      customers: rs.length,
      buyers: buyers.length,
      value_12m: Math.round(value),
      share: total ? Math.round(value / total * 100) : 0,
      slipping: rs.filter((r) => r.label === "Slipping" || r.label === "Dormant").length,
      risky: rs.filter((r) => r.label === "Risky").length,
      not_contacted_60d: buyers.filter((r) => !touched.has(r.id)).length,
      owners: [...owners].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n)
    };
  }).sort((a, b) => b.value_12m - a.value_12m);
  return { districts, users: [...users].map(([id, name]) => ({ id, name })).sort((a, b) => String(a.name).localeCompare(String(b.name))) };
});

export { territory_get as default };
//# sourceMappingURL=territory.get.mjs.map
