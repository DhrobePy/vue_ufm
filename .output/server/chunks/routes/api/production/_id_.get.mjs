import { m as defineEventHandler, i as createError, a2 as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const STATUS_MAP = {
  pending: "pending",
  in_progress: "running",
  completed: "completed",
  delayed: "paused"
};
const _id__get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const rawId = ((_a = event.context.params) == null ? void 0 : _a.id) || "";
  const numericId = Number(rawId.replace(/^PS-/i, ""));
  if (!numericId) throw createError({ statusCode: 400, statusMessage: "Invalid production ID" });
  const ps = await queryOne(
    `SELECT ps.id, ps.scheduled_date, ps.status, ps.notes, ps.priority_order,
            ps.production_started_at, ps.production_completed_at,
            co.id AS credit_order_id, co.order_number,
            co.total_amount, co.total_weight_kg,
            c.name AS customer_name,
            b.name AS branch_name,
            u.display_name AS manager_name
     FROM production_schedule ps
     JOIN credit_orders co ON co.id = ps.order_id
     JOIN customers c      ON c.id  = co.customer_id
     LEFT JOIN branches b  ON b.id  = ps.branch_id
     LEFT JOIN users u     ON u.id  = ps.production_manager_id
     WHERE ps.id = ?`,
    [numericId]
  );
  if (!ps) throw createError({ statusCode: 404, statusMessage: "Production batch not found" });
  const noteParts = {};
  for (const part of ((_b = ps.notes) != null ? _b : "").split("|")) {
    const sep = part.indexOf(":");
    if (sep > 0) {
      const k = part.slice(0, sep).trim();
      const v = part.slice(sep + 1).trim();
      noteParts[k] = v;
    }
  }
  const bagWeightKg = 50;
  const totalWeightKg = Number(ps.total_weight_kg) || 0;
  const targetBags = totalWeightKg > 0 ? Math.ceil(totalWeightKg / bagWeightKg) : 0;
  const startedAt = ps.production_started_at;
  const startDate = startedAt ? startedAt.slice(0, 10) : ps.scheduled_date;
  const startTime = startedAt ? startedAt.slice(11, 16) : "";
  return {
    id: `PS-${ps.id}`,
    dbId: ps.id,
    orderId: ps.order_number,
    creditOrderId: ps.credit_order_id,
    customer: ps.customer_name,
    product: (_c = noteParts["Product"]) != null ? _c : ps.order_number,
    status: (_d = STATUS_MAP[ps.status]) != null ? _d : ps.status,
    scheduledDate: ps.scheduled_date,
    startDate,
    startTime,
    machine: (_e = noteParts["Machine"]) != null ? _e : "\u2014",
    shift: (_f = noteParts["Shift"]) != null ? _f : "\u2014",
    operator: (_g = noteParts["Operator"]) != null ? _g : "\u2014",
    rawMaterial: (_h = noteParts["Raw Material"]) != null ? _h : "\u2014",
    bagWeightKg,
    targetBags,
    doneBags: 0,
    branch: (_i = ps.branch_name) != null ? _i : "",
    manager: (_j = ps.manager_name) != null ? _j : "",
    notes: (_k = ps.notes) != null ? _k : "",
    updates: [],
    qualityChecks: []
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
