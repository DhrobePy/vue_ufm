import { V as defineEventHandler, L as crmUser, bb as readBody, J as createError, b8 as query, l as SEGMENTS } from '../../../nitro/nitro.mjs';
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

const prospects_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const me = await crmUser(event), b = await readBody(event);
  const name = String((_a = b == null ? void 0 : b.name) != null ? _a : "").trim();
  if (!name) throw createError({ statusCode: 400, statusMessage: "A name is required" });
  const phone = String((_b = b == null ? void 0 : b.phone) != null ? _b : "").trim() || null, last9 = String(phone != null ? phone : "").replace(/\D/g, "").slice(-9);
  if (last9.length >= 8 && !(b == null ? void 0 : b.allow_duplicate)) {
    const dupC = await query(`SELECT id, name FROM customers WHERE RIGHT(REGEXP_REPLACE(phone_number, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9]);
    if (dupC.length) throw createError({ statusCode: 409, statusMessage: `Already a customer: ${dupC[0].name} (#${dupC[0].id}) \u2014 has the same phone number` });
    const dupP = await query(`SELECT id, name FROM crm_prospects WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9]);
    if (dupP.length) throw createError({ statusCode: 409, statusMessage: `Already a prospect: ${dupP[0].name} (#${dupP[0].id}) \u2014 has the same phone number` });
  }
  const seg = SEGMENTS.includes(b == null ? void 0 : b.segment) ? b.segment : null;
  const s = (k, n = 200) => {
    var _a2;
    return String((_a2 = b == null ? void 0 : b[k]) != null ? _a2 : "").trim().slice(0, n) || null;
  };
  const r = await query(
    `INSERT INTO crm_prospects (name, business_name, segment, district, address, phone, phone2, email, website, contact_person, source, source_url, source_note, owner_user_id, created_by_user_id, created_by_agent, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [name.slice(0, 160), s("business_name", 160), seg, s("district", 40), s("address", 300), (_c = phone == null ? void 0 : phone.slice(0, 40)) != null ? _c : null, s("phone2", 40), s("email", 160), s("website", 300), s("contact_person", 120), (_d = s("source", 60)) != null ? _d : "manual", s("source_url", 500), s("source_note", 500), me.id, me.id, s("notes", 2e3)]
  );
  return { ok: true, id: r.insertId };
});

export { prospects_post as default };
//# sourceMappingURL=prospects.post.mjs.map
