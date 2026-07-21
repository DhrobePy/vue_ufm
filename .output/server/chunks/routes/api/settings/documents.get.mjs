import { o as defineEventHandler, x as getDb } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const DEFAULTS = {
  tc_purchase_order: [
    "Goods must conform to specified quality standards upon delivery.",
    "Moisture content must not exceed 13% for wheat.",
    "Supplier must provide phytosanitary certificate for imported wheat.",
    "Payment terms as stated above from GRN acceptance.",
    "Any short delivery must be notified before unloading.",
    "Subject to Sirajgonj jurisdiction."
  ].join("\n"),
  tc_credit_invoice: [
    "Payment due within 30 days of invoice date.",
    "Goods once sold cannot be returned without prior written approval.",
    "Interest @ 2% per month charged on overdue balances.",
    "All disputes subject to Sirajgonj jurisdiction.",
    "This invoice is valid only with authorised company stamp."
  ].join("\n")
};
const documents_get = defineEventHandler(async () => {
  var _a, _b;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT setting_key, setting_value FROM system_settings
       WHERE setting_key IN ('tc_purchase_order','tc_credit_invoice')`
    );
    const result = { ...DEFAULTS };
    for (const row of rows) {
      result[row.setting_key] = (_b = (_a = row.setting_value) != null ? _a : DEFAULTS[row.setting_key]) != null ? _b : "";
    }
    return { settings: result };
  } finally {
    conn.release();
  }
});

export { documents_get as default };
//# sourceMappingURL=documents.get.mjs.map
