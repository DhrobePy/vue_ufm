import { h as defineEventHandler, v as getRouterParam, e as createError, w as getUserSession, n as getDb, L as recalcPO } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid payment ID" });
  const session = await getUserSession(event);
  const userName = (_d = (_c = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.name) != null ? _c : (_b = session == null ? void 0 : session.user) == null ? void 0 : _b.email) != null ? _d : "System";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[pmt]] = await conn.query(
      `SELECT id, payment_voucher_number, purchase_order_id, is_posted, remarks
       FROM purchase_payments_adnan WHERE id = ?`,
      [id]
    );
    if (!pmt) throw createError({ statusCode: 404, statusMessage: "Payment not found" });
    if (pmt.is_posted) {
      const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
      const newNote = `
[DELETED: ${userName} @ ${now}]`;
      await conn.query(
        `UPDATE purchase_payments_adnan
         SET is_posted  = 0,
             remarks    = CONCAT(COALESCE(remarks, ''), ?),
             updated_at = NOW()
         WHERE id = ?`,
        [newNote, id]
      );
    } else {
      await conn.query(`DELETE FROM purchase_payments_adnan WHERE id = ?`, [id]);
    }
    await recalcPO(conn, pmt.purchase_order_id);
    await conn.commit();
    return { ok: true, message: `Payment ${pmt.payment_voucher_number} deleted` };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
