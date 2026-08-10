import { q as defineEventHandler, as as readBody, m as createError, z as getDb, ap as query } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "create") {
    const { holiday_date, holiday_name, description } = body;
    if (!holiday_date || !holiday_name) throw createError({ statusCode: 400, statusMessage: "Date and name required" });
    try {
      await getDb().query(
        "INSERT INTO hr_holidays (holiday_date, holiday_name, description) VALUES (?, ?, ?)",
        [holiday_date, holiday_name, description || null]
      );
      return { ok: true, message: "Holiday added." };
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") throw createError({ statusCode: 400, statusMessage: "Holiday already exists for this date" });
      throw e;
    }
  }
  if (action === "delete") {
    const { id } = body;
    await query("DELETE FROM hr_holidays WHERE id = ?", [id]);
    return { ok: true, message: "Holiday deleted." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post6.mjs.map
