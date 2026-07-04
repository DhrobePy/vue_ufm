import { m as defineEventHandler, H as getRouterParam, i as createError, a3 as queryOne, a2 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [order, items, workflow, deliveries, returns, payments] = await Promise.all([
    queryOne(
      `SELECT o.*,
              c.name AS customer_name, c.business_name, c.phone_number,
              c.customer_type, c.credit_limit, c.current_balance,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name,
              b.name AS branch_name,
              -- Ledger balance = actual delivered-but-unpaid amount (double-entry running total)
              COALESCE((
                SELECT SUM(cl.debit_amount) - SUM(cl.credit_amount)
                FROM customer_ledger cl WHERE cl.customer_id = c.id
              ), 0) AS ledger_balance,
              -- Pending commitment = balance_due on orders not yet on the ledger
              -- (pre-delivery states only \u2014 delivered orders are already in the ledger)
              COALESCE((
                SELECT SUM(o2.balance_due)
                FROM credit_orders o2
                WHERE o2.customer_id = c.id
                  AND o2.status IN ('pending_approval','approved','in_production','ready_to_ship','shipped','dispatched')
                  AND o2.id != o.id
              ), 0) AS other_pending_exposure,
              -- This order's own uncommitted balance (if not yet delivered)
              CASE WHEN o.status IN ('pending_approval','approved','in_production','ready_to_ship','shipped','dispatched')
                   THEN o.balance_due ELSE 0 END AS this_order_pending
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users cr ON cr.id = o.created_by_user_id
       LEFT JOIN users ap ON ap.id = o.approved_by_user_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.id = ?`,
      [id]
    ),
    query(
      `SELECT oi.*, oi.quantity AS qty_bags,
              p.base_name AS product_name, pv.weight_variant, pv.grade, pv.sku
       FROM credit_order_items oi
       LEFT JOIN products p  ON p.id = oi.product_id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
      [id]
    ),
    query(
      `SELECT w.*, u.display_name AS performed_by_name
       FROM credit_order_workflow w
       LEFT JOIN users u ON u.id = w.performed_by_user_id
       WHERE w.order_id = ?
       ORDER BY w.performed_at ASC`,
      [id]
    ),
    query(
      `SELECT d.*, u.display_name AS created_by_name
       FROM credit_order_deliveries d
       LEFT JOIN users u ON u.id = d.created_by_user_id
       WHERE d.order_id = ?
       ORDER BY d.delivery_date DESC`,
      [id]
    ),
    query(
      `SELECT r.*,
              u.display_name AS created_by_name,
              a.display_name AS approved_by_name
       FROM credit_order_returns r
       LEFT JOIN users u ON u.id = r.created_by_user_id
       LEFT JOIN users a ON a.id = r.approved_by_user_id
       WHERE r.order_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    ),
    // Payments linked to this specific order
    query(
      `SELECT p.id, p.order_id, p.payment_number, p.payment_date, p.amount,
              p.payment_method, p.payment_type, p.reference_number,
              p.bank_account_id, p.cash_account_id,
              p.cheque_number, p.cheque_date, p.bank_transaction_type,
              p.journal_entry_id, p.notes, p.created_at,
              u.display_name  AS collected_by,
              e.first_name    AS collector_first_name,
              e.last_name     AS collector_last_name,
              ba.bank_name    AS bank_name,
              ba.account_number AS bank_account_number,
              ca.account_name AS cash_account_name
       FROM customer_payments p
       LEFT JOIN users u     ON u.id = p.created_by_user_id
       LEFT JOIN employees e ON e.id = p.collected_by_employee_id
       LEFT JOIN bank_accounts ba ON ba.id = p.bank_account_id
       LEFT JOIN branch_petty_cash_accounts ca ON ca.id = p.cash_account_id
       WHERE p.order_id = ?
       ORDER BY p.payment_date ASC, p.created_at ASC`,
      [id]
    )
  ]);
  if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  const ord = order;
  if (ord.status === "delivered" && Number(ord.balance_due) === 0) {
    ord.status = "completed";
  }
  for (const ret of returns) {
    ret.items = await query(
      `SELECT ri.*, p.base_name AS product_name, pv.weight_variant
       FROM credit_order_return_items ri
       LEFT JOIN products p  ON p.id = ri.product_id
       LEFT JOIN product_variants pv ON pv.id = ri.variant_id
       WHERE ri.return_id = ?`,
      [ret.id]
    );
  }
  return { order, items, workflow, deliveries, returns, payments };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
