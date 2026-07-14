import { n as defineEventHandler, H as getRouterParam, a7 as readBody, j as createError, K as getUserSession, B as getRequestIP, u as getDb } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action } = body;
  if (!["approve", "reject", "unpost", "update"].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: "Invalid action" });
  }
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const userName = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const role = ((_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.role) != null ? _f : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const ip = (_g = getRequestIP(event)) != null ? _g : null;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[txn]] = await conn.query(
      `SELECT t.* FROM bank_transactions t WHERE t.id = ?`,
      [id]
    );
    if (!txn) throw createError({ statusCode: 404, statusMessage: "Transaction not found" });
    if (action === "unpost") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin can unpost transactions" });
      if (txn.status === "unposted") throw createError({ statusCode: 400, statusMessage: "Transaction is already unposted" });
      const oldStatus = txn.status;
      await conn.query(
        `UPDATE bank_transactions SET status = 'unposted', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      await conn.query(
        `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
         VALUES (?, 'unposted', ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          userName,
          ip,
          JSON.stringify({ status: oldStatus }),
          JSON.stringify({ status: "unposted" }),
          body.notes || null
        ]
      );
      await conn.commit();
      return { message: "Transaction unposted successfully" };
    }
    if (action === "update") {
      if (!isAdmin && txn.status !== "pending") {
        throw createError({ statusCode: 403, statusMessage: "Only admin can edit non-pending transactions" });
      }
      const setParts = [];
      const vals = [];
      const old = {};
      const nw = {};
      if (body.description !== void 0) {
        setParts.push("description = ?");
        vals.push(body.description);
        old.description = txn.description;
        nw.description = body.description;
      }
      if (body.amount !== void 0) {
        setParts.push("amount = ?");
        vals.push(body.amount);
        old.amount = txn.amount;
        nw.amount = body.amount;
      }
      if (body.reference_number !== void 0) {
        setParts.push("reference_number = ?");
        vals.push(body.reference_number);
        old.reference_number = txn.reference_number;
        nw.reference_number = body.reference_number;
      }
      if (body.cheque_number !== void 0) {
        setParts.push("cheque_number = ?");
        vals.push(body.cheque_number);
        old.cheque_number = txn.cheque_number;
        nw.cheque_number = body.cheque_number;
      }
      if (body.payee_payer_name !== void 0) {
        setParts.push("payee_payer_name = ?");
        vals.push(body.payee_payer_name);
        old.payee_payer_name = txn.payee_payer_name;
        nw.payee_payer_name = body.payee_payer_name;
      }
      if (body.special_note !== void 0) {
        setParts.push("special_note = ?");
        vals.push(body.special_note);
        old.special_note = txn.special_note;
        nw.special_note = body.special_note;
      }
      if (body.transaction_date !== void 0) {
        setParts.push("transaction_date = ?");
        vals.push(body.transaction_date);
        old.transaction_date = txn.transaction_date;
        nw.transaction_date = body.transaction_date;
      }
      if (setParts.length) {
        setParts.push("updated_at = NOW()");
        await conn.query(`UPDATE bank_transactions SET ${setParts.join(", ")} WHERE id = ?`, [...vals, id]);
        await conn.query(
          `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values)
           VALUES (?, 'updated', ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip, JSON.stringify(old), JSON.stringify(nw)]
        );
      }
      await conn.commit();
      return { message: "Transaction updated successfully" };
    }
    if (txn.status !== "pending") {
      throw createError({ statusCode: 400, statusMessage: `Transaction is ${txn.status} \u2014 cannot ${action}` });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";
    await conn.query(
      `UPDATE bank_transactions
       SET status = ?, special_note = COALESCE(?, special_note), updated_at = NOW()
       WHERE id = ?`,
      [newStatus, body.notes || null, id]
    );
    await conn.query(
      `INSERT INTO bank_tx_audit_log (tx_id, action, user_id, user_name, ip_address, old_values, new_values, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        action === "approve" ? "approved" : "rejected",
        userId,
        userName,
        ip,
        JSON.stringify({ status: "pending" }),
        JSON.stringify({ status: newStatus }),
        body.notes || null
      ]
    );
    await conn.commit();
    return { message: `Transaction ${action}d successfully` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
