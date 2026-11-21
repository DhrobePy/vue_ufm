import { X as defineEventHandler, am as getQuery, bb as query, Q as customerHealth, v as assessProspect } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const prospects_get = defineEventHandler(async (event) => {
  var _a, _b;
  const stage = String((_a = getQuery(event).stage) != null ? _a : "");
  const rows = await query(
    `SELECT p.*, (SELECT MAX(i.created_at) FROM crm_interactions i WHERE i.party_type = 'prospect' AND i.party_id = p.id) AS last_contact, u.display_name AS owner_name
     FROM crm_prospects p LEFT JOIN users u ON u.id = p.owner_user_id ${stage ? "WHERE p.stage = ?" : ""} ORDER BY FIELD(p.stage,'new','researching','contacted','quoted','trial','won','lost'), p.updated_at DESC LIMIT 300`,
    stage ? [stage] : []
  );
  const health = await customerHealth();
  const out = [];
  for (const p of rows) {
    const checklist = typeof p.checklist === "string" ? JSON.parse(p.checklist || "{}") : (_b = p.checklist) != null ? _b : {};
    const a = await assessProspect({ ...p, checklist }, health);
    out.push({ ...p, checklist, fit: a.fit, risk_band: a.risk.band, verdict: a.verdict, confidence: a.confidence, potential_monthly_low: a.potential.monthly_low, potential_monthly_high: a.potential.monthly_high });
  }
  return { prospects: out };
});

export { prospects_get as default };
//# sourceMappingURL=prospects.get.mjs.map
