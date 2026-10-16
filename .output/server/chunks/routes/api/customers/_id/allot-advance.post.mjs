import { w as defineEventHandler, a3 as getRouterParam, a8 as getUserSession, t as createError, ac as isAccountsRole, aI as readBody, L as getDb, F as getAdvanceCredit, ba as suggestAllotment, h as applyAllotment, l as auditLog } from '../../../../nitro/nitro.mjs';
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

const allotAdvance_post = defineEventHandler(async (event) => {
  var _a;
  const customerId = Number(getRouterParam(event, "id"));
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role)) throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  const body = await readBody(event);
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    let allots;
    if (body == null ? void 0 : body.auto) {
      const credit = await getAdvanceCredit(conn, customerId);
      allots = suggestAllotment(
        credit,
        body.auto === "opening_first" ? "opening_first" : "orders_first",
        { onlyOrderId: body.order_id ? Number(body.order_id) : void 0 }
      );
    } else {
      allots = (Array.isArray(body == null ? void 0 : body.allocations) ? body.allocations : []).map((a) => ({
        payment_id: Number(a.payment_id),
        target: a.target === "opening" ? "opening" : "order",
        order_id: a.order_id ? Number(a.order_id) : void 0,
        amount: Number(a.amount)
      })).filter((a) => a.payment_id && a.amount > 0);
    }
    if (!allots.length) throw createError({ statusCode: 400, statusMessage: "Nothing to allot \u2014 no advance credit or no open order/opening due to apply it to" });
    const res = await applyAllotment(conn, customerId, userId, allots, "allotted by accounts");
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "credit_sales",
      recordType: "customer",
      recordId: customerId,
      referenceNumber: `CUST-${customerId}`,
      description: `Advance credit \u09F3${res.total.toLocaleString()} allotted: ${allots.map((a) => a.target === "opening" ? `opening due \u09F3${a.amount}` : `order #${a.order_id} \u09F3${a.amount}`).join(", ")}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, ...res };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { allotAdvance_post as default };
//# sourceMappingURL=allot-advance.post.mjs.map
