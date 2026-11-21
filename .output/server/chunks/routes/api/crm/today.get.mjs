import { Z as defineEventHandler, a3 as dhakaToday, Q as crmUser, aR as maybeTriggerCrmBrief, bR as scopedHealth, aU as nextActions, bl as query } from '../../../nitro/nitro.mjs';
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

const today_get = defineEventHandler(async (event) => {
  const today = dhakaToday(), me = await crmUser(event);
  maybeTriggerCrmBrief();
  const rows = await scopedHealth(event);
  const next = await nextActions(rows, { userId: me.id, limit: 12 });
  const tasks = await query(
    `SELECT t.id, t.party_type, t.party_id, t.kind, t.title, t.due_date, t.promise_amount, t.created_by_agent,
            COALESCE(c.name, p.name) AS party_name, u.display_name AS assigned_to, (t.due_date < ?) AS overdue
     FROM crm_tasks t LEFT JOIN customers c ON t.party_type = 'customer' AND c.id = t.party_id LEFT JOIN crm_prospects p ON t.party_type = 'prospect' AND p.id = t.party_id
     LEFT JOIN users u ON u.id = t.assigned_user_id
     WHERE t.status = 'open' AND (t.due_date IS NULL OR t.due_date <= DATE_ADD(?, INTERVAL 3 DAY)) ORDER BY t.due_date IS NULL, t.due_date, t.id LIMIT 150`,
    [today, today]
  );
  const hasTask = new Set((await query(`SELECT DISTINCT party_id FROM crm_tasks WHERE status = 'open' AND party_type = 'customer'`)).map((r) => r.party_id));
  const calls = rows.filter((r) => r.priority >= 45 && r.suggestions.length).sort((a, b) => b.priority - a.priority).slice(0, 15).map((r) => ({ ...r, has_open_task: hasTask.has(r.id) }));
  const cold = await query(
    `SELECT p.id, p.name, p.stage, p.segment, p.district, DATEDIFF(?, COALESCE((SELECT MAX(i.created_at) FROM crm_interactions i WHERE i.party_type = 'prospect' AND i.party_id = p.id), p.created_at)) AS idle_days
     FROM crm_prospects p WHERE p.stage IN ('new','researching','contacted','quoted','trial') HAVING idle_days >= 5 ORDER BY idle_days DESC LIMIT 15`,
    [today]
  );
  const pipeline = await query(`SELECT stage, COUNT(*) n FROM crm_prospects GROUP BY stage`);
  return { today, next, tasks, calls, cold_prospects: cold, pipeline, counts: { open_tasks: tasks.length, overdue: tasks.filter((t) => Number(t.overdue)).length } };
});

export { today_get as default };
//# sourceMappingURL=today.get.mjs.map
