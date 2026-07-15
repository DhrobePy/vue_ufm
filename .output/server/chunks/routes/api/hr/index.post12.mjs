import { o as defineEventHandler, ae as readBody, w as getDb, ab as query, k as createError } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "update_general") {
    const { settings } = body;
    const db = getDb();
    for (const [name, value] of Object.entries(settings)) {
      await db.query(
        "INSERT INTO hr_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [name, value]
      );
    }
    return { ok: true, message: "Settings saved." };
  }
  if (action === "update_overtime") {
    const { normal_rate, holiday_rate, max_daily_ot, max_monthly_ot, auto_approve } = body;
    await query(
      "UPDATE hr_overtime_settings SET normal_rate=?, holiday_rate=?, max_daily_ot=?, max_monthly_ot=?, auto_approve=? WHERE id=1",
      [normal_rate, holiday_rate, max_daily_ot, max_monthly_ot, auto_approve ? 1 : 0]
    );
    return { ok: true, message: "Overtime settings saved." };
  }
  if (action === "update_pf") {
    const { employee_rate, employer_rate, eligibility_months, mandatory, vesting_months } = body;
    await query(
      "UPDATE hr_pf_settings SET employee_rate=?, employer_rate=?, eligibility_months=?, mandatory=?, vesting_months=? WHERE id=1",
      [employee_rate, employer_rate, eligibility_months, mandatory ? 1 : 0, vesting_months]
    );
    return { ok: true, message: "PF settings saved." };
  }
  if (action === "update_gratuity") {
    const { rate_per_year, min_years, max_months, basis } = body;
    await query(
      "UPDATE hr_gratuity_settings SET rate_per_year=?, min_years=?, max_months=?, basis=? WHERE id=1",
      [rate_per_year, min_years, max_months, basis]
    );
    return { ok: true, message: "Gratuity settings saved." };
  }
  if (action === "update_tax") {
    const { fiscal_year, tax_free_limit, slabs_json } = body;
    await query(
      "UPDATE hr_tax_settings SET fiscal_year=?, tax_free_limit=?, slabs_json=? WHERE id=1",
      [fiscal_year, tax_free_limit, JSON.stringify(slabs_json)]
    );
    return { ok: true, message: "Tax settings saved." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post12.mjs.map
