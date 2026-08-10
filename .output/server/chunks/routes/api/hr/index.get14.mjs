import { q as defineEventHandler, J as getQuery, ap as query, aq as queryOne, m as createError } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const section = q.section || "general";
  if (section === "general") {
    const rows = await query("SELECT name, value FROM hr_settings");
    const settings = {};
    for (const r of rows) settings[r.name] = r.value;
    return { settings };
  }
  if (section === "overtime") {
    const s = await queryOne("SELECT * FROM hr_overtime_settings WHERE id = 1");
    return { settings: s };
  }
  if (section === "pf") {
    const s = await queryOne("SELECT * FROM hr_pf_settings WHERE id = 1");
    return { settings: s };
  }
  if (section === "gratuity") {
    const s = await queryOne("SELECT * FROM hr_gratuity_settings WHERE id = 1");
    return { settings: s };
  }
  if (section === "tax") {
    const s = await queryOne("SELECT * FROM hr_tax_settings WHERE id = 1");
    return { settings: s };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown section" });
});

export { index_get as default };
//# sourceMappingURL=index.get14.mjs.map
