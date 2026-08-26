import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, ar as queryOne, aq as query } from '../../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid sale ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const sale = await queryOne(
    `SELECT s.*, c.name AS customer_name, c.phone_number AS customer_phone,
            pc.name AS commodity_name, pc.unit AS commodity_unit,
            b.name AS branch_name, u.display_name AS created_by,
            po.po_number AS source_po_number
     FROM commodity_sales s
     JOIN customers c ON c.id = s.customer_id
     JOIN purchase_commodities pc ON pc.id = s.commodity_id
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.created_by_user_id
     LEFT JOIN purchase_orders_adnan po ON po.id = s.source_purchase_order_id
     WHERE s.id = ?`,
    [id]
  );
  if (!sale) {
    const fwd = await queryOne(
      `SELECT new_sale_id FROM commodity_sale_edits
       WHERE old_sale_id = ? AND status = 'approved' AND new_sale_id IS NOT NULL
       ORDER BY id DESC LIMIT 1`,
      [id]
    );
    if (fwd == null ? void 0 : fwd.new_sale_id) return { superseded_by: fwd.new_sale_id };
    throw createError({ statusCode: 404, statusMessage: "Sale not found" });
  }
  const [jeLines, payments, dispatch, editsBack, editPending] = await Promise.all([
    sale.journal_entry_id ? query(
      `SELECT tl.debit_amount, tl.credit_amount, tl.description, coa.name AS account_name
           FROM transaction_lines tl JOIN chart_of_accounts coa ON coa.id = tl.account_id
           WHERE tl.journal_entry_id = ?`,
      [sale.journal_entry_id]
    ) : Promise.resolve([]),
    query(
      `SELECT p.*, u.display_name AS collected_by
       FROM commodity_sale_payments p LEFT JOIN users u ON u.id = p.created_by_user_id
       WHERE p.sale_id = ? ORDER BY p.payment_date, p.id`,
      [id]
    ),
    queryOne(`SELECT * FROM commodity_dispatch_confirmations WHERE sale_id = ?`, [id]),
    // Timeline: walk the chain backward (bounded 20 hops)
    (async () => {
      const chain = [];
      let cur = id;
      for (let i = 0; i < 20; i++) {
        const edit = await queryOne(
          `SELECT e.*, ru.display_name AS requested_by, du.display_name AS decided_by
           FROM commodity_sale_edits e
           LEFT JOIN users ru ON ru.id = e.requested_by_user_id
           LEFT JOIN users du ON du.id = e.decided_by_user_id
           WHERE e.new_sale_id = ? AND e.status = 'approved'
           ORDER BY e.id DESC LIMIT 1`,
          [cur]
        );
        if (!edit) break;
        chain.push(edit);
        cur = edit.old_sale_id;
      }
      return chain.reverse();
    })(),
    queryOne(
      `SELECT e.*, ru.display_name AS requested_by
       FROM commodity_sale_edits e LEFT JOIN users ru ON ru.id = e.requested_by_user_id
       WHERE e.old_sale_id = ? AND e.status = 'pending_approval' LIMIT 1`,
      [id]
    )
  ]);
  return { sale, je_lines: jeLines, payments, dispatch, edit_chain: editsBack, pending_edit: editPending };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
