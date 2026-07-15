import { n as defineEventHandler, K as getRouterParam, j as createError, N as getUserSession, a as ADMIN_ROLES, aa as readBody, v as getDb, y as getGLAccountId, a5 as postJournalEntry, e as auditLog, an as sendTelegram } from '../../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const status_patch = defineEventHandler(async (event) => {
  var _a, _b;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid adjustment ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const role = ((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  const body = await readBody(event);
  const action = body == null ? void 0 : body.action;
  const notes = body == null ? void 0 : body.notes;
  if (!["approve", "reject"].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[adj]] = await conn.query(
      `SELECT sa.*, pv.sku, pv.stock_qty, p.base_name AS product_name
       FROM stock_adjustments sa
       JOIN product_variants pv ON pv.id = sa.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE sa.id = ? FOR UPDATE`,
      [id]
    );
    if (!adj) throw createError({ statusCode: 404, statusMessage: "Adjustment not found" });
    if (adj.status !== "pending")
      throw createError({ statusCode: 409, statusMessage: `Already ${adj.status}` });
    if (Number(adj.created_by_user_id) === userId)
      throw createError({ statusCode: 403, statusMessage: "You recorded this adjustment \u2014 a different authorised user must decide it" });
    const newStatus = action === "approve" ? "approved" : "rejected";
    const delta = Number(adj.delta);
    let jeId = null;
    if (action === "approve") {
      await conn.query(
        `UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty + ?), updated_at = NOW() WHERE id = ?`,
        [delta, adj.variant_id]
      );
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const invId = await getGLAccountId(conn, "Other Current Asset");
      const offsetId = delta < 0 ? await getGLAccountId(conn, "Cost of Goods Sold") : await getGLAccountId(conn, "Other Income");
      if (invId && offsetId) {
        const lines = delta < 0 ? [
          { accountId: offsetId, debit: Math.abs(delta), credit: 0, memo: adj.adj_number },
          { accountId: invId, debit: 0, credit: Math.abs(delta), memo: adj.adj_number }
        ] : [
          { accountId: invId, debit: delta, credit: 0, memo: adj.adj_number },
          { accountId: offsetId, debit: 0, credit: delta, memo: adj.adj_number }
        ];
        jeId = await postJournalEntry(conn, {
          date,
          description: `Stock adjustment ${adj.adj_number} \u2014 ${adj.product_name} (${adj.sku})`,
          docType: "StockAdjustment",
          docId: id,
          userId,
          lines
        });
      }
    }
    await conn.query(
      `UPDATE stock_adjustments
       SET status = ?, approved_by_user_id = ?, approved_at = NOW(), decision_note = ?, journal_entry_id = ?
       WHERE id = ?`,
      [newStatus, userId, notes != null ? notes : null, jeId, id]
    );
    await auditLog(conn, {
      userId,
      action: action === "approve" ? "approved" : "rejected",
      module: "products",
      recordType: "stock_adjustment",
      recordId: id,
      referenceNumber: adj.adj_number,
      description: `Stock adjustment ${adj.adj_number} (${adj.product_name}, ${adj.sku}) ${action}d \u2014 ${delta > 0 ? "+" : ""}${delta}${notes ? ` \xB7 ${notes}` : ""}`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `${action === "approve" ? "\u2705" : "\u274C"} <b>Stock Adjustment ${action === "approve" ? "Approved" : "Rejected"}</b>
${adj.adj_number} \u2014 ${adj.product_name} (${adj.sku})
${delta > 0 ? "+" : ""}${delta} bags \xB7 by ${userName}`
    );
    return { ok: true, status: newStatus };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { status_patch as default };
//# sourceMappingURL=status.patch.mjs.map
