import { o as defineEventHandler, Q as getUserSession, k as createError, af as readBody, ac as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const creditWorkflow_put = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin"].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: "Only admins can change credit workflow settings" });
  }
  const body = await readBody(event);
  const settings = {
    dispatch_global_hold: (body == null ? void 0 : body.dispatch_global_hold) !== void 0 ? Boolean(body.dispatch_global_hold) : true,
    credit_limit_auto_release: Boolean(body == null ? void 0 : body.credit_limit_auto_release)
  };
  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('credit_workflow_policy', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [JSON.stringify(settings)]
  );
  return { ok: true, settings };
});

export { creditWorkflow_put as default };
//# sourceMappingURL=credit-workflow.put.mjs.map
