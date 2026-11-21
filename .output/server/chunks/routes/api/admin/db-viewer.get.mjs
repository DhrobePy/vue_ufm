import { X as defineEventHandler, ay as getUserSession, L as createError, am as getQuery, bb as query } from '../../../nitro/nitro.mjs';
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

const SECRET_COL = /pass(word|wd)|secret|token|api[_-]?key|refresh|private|otp|\bhash\b|_hash$/i;
const SECRET_SETTING = /pass|secret|token|key|refresh|credential|oauth/i;
const PER = 50;
const dbViewer_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const session = await getUserSession(event);
  if (String((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() !== "superadmin")
    throw createError({ statusCode: 403, statusMessage: "The DB Viewer is for the Superadmin only" });
  const q = getQuery(event);
  const tables = await query(`SELECT TABLE_NAME AS name, TABLE_ROWS AS approx_rows, TABLE_TYPE AS kind FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`);
  const table = String((_c = q.table) != null ? _c : "");
  if (!table) return { tables: tables.map((t) => {
    var _a2;
    return { name: t.name, rows: Number((_a2 = t.approx_rows) != null ? _a2 : 0), view: t.kind === "VIEW" };
  }) };
  if (!tables.some((t) => t.name === table)) throw createError({ statusCode: 404, statusMessage: "Unknown table" });
  const cols = await query(`SELECT COLUMN_NAME AS name, DATA_TYPE AS type, COLUMN_KEY AS ckey FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`, [table]);
  const visible = cols.filter((c) => !SECRET_COL.test(c.name));
  const hidden = cols.filter((c) => SECRET_COL.test(c.name)).map((c) => c.name);
  const pk = (_f = (_d = cols.find((c) => c.ckey === "PRI")) == null ? void 0 : _d.name) != null ? _f : (_e = cols[0]) == null ? void 0 : _e.name;
  const page = Math.max(1, Number(q.page) || 1);
  const search = String((_g = q.q) != null ? _g : "").trim();
  const textCols = visible.filter((c) => /char|text|enum|date|time|int|decimal|double|float/.test(c.type)).map((c) => `\`${c.name}\``);
  const where = search && textCols.length ? `WHERE CONCAT_WS('\xA6', ${textCols.join(", ")}) LIKE ?` : "";
  const params = search && textCols.length ? [`%${search}%`] : [];
  const [{ n }] = await query(`SELECT COUNT(*) AS n FROM \`${table}\` ${where}`, params);
  const rows = await query(`SELECT ${visible.map((c) => `\`${c.name}\``).join(", ") || "1"} FROM \`${table}\` ${where} ${pk ? `ORDER BY \`${pk}\` DESC` : ""} LIMIT ${PER} OFFSET ${(page - 1) * PER}`, params);
  if (table === "system_settings") {
    for (const r of rows) if (SECRET_SETTING.test(String((_h = r.setting_key) != null ? _h : ""))) r.setting_value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  }
  const clip = (v) => typeof v === "string" && v.length > 400 ? v.slice(0, 400) + "\u2026" : v;
  return {
    table,
    columns: visible.map((c) => ({ name: c.name, type: c.type, pk: c.ckey === "PRI" })),
    hidden,
    total: Number(n),
    page,
    per: PER,
    rows: rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, clip(v)])))
  };
});

export { dbViewer_get as default };
//# sourceMappingURL=db-viewer.get.mjs.map
