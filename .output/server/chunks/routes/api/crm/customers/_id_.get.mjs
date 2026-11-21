import { Z as defineEventHandler, aB as getRouterParam, bU as scopedHealth, N as createError, bn as query, bF as reorderRadar, U as crossSell, b4 as phone9 } from '../../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a;
  const id = Number(getRouterParam(event, "id"));
  const all = await scopedHealth(event), me = all.find((r) => r.id === id);
  if (!me) throw createError({ statusCode: 404, statusMessage: "Customer not found (or outside your branch)" });
  const [orders, payments, interactions, tasks] = await Promise.all([
    query(`SELECT id, order_number, order_date, total_amount AS amount, balance_due AS due, status FROM credit_orders WHERE customer_id = ? ORDER BY order_date DESC, id DESC LIMIT 10`, [id]),
    query(`SELECT payment_number, payment_date, amount, payment_method AS method FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL ORDER BY payment_date DESC, id DESC LIMIT 10`, [id]),
    query(`SELECT i.id, i.channel, i.direction, i.summary, i.outcome, i.created_at, i.via_agent, u.display_name AS by_user FROM crm_interactions i LEFT JOIN users u ON u.id = i.user_id WHERE i.party_type = 'customer' AND i.party_id = ? ORDER BY i.id DESC LIMIT 30`, [id]),
    query(`SELECT t.id, t.kind, t.title, t.due_date, t.promise_amount, t.status, t.created_by_agent, u.display_name AS assigned_to FROM crm_tasks t LEFT JOIN users u ON u.id = t.assigned_user_id WHERE t.party_type = 'customer' AND t.party_id = ? ORDER BY (t.status = 'open') DESC, t.due_date, t.id DESC LIMIT 30`, [id])
  ]);
  const [radar, cs] = await Promise.all([reorderRadar(all), crossSell(all)]);
  const opted = me.phone ? (await query(`SELECT 1 x FROM crm_optout WHERE phone9 = ?`, [phone9(me.phone)]).catch(() => [])).length > 0 : false;
  return { customer: me, orders, payments, interactions, tasks, reorder: (_a = radar.find((r) => r.id === id)) != null ? _a : null, cross_sell: cs.suggestions.filter((s) => s.customer_id === id).slice(0, 3), opted_out: opted };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
