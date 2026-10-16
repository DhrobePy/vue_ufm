import { u as defineEventHandler, a0 as getRouterParam, r as createError, a5 as getUserSession, aD as queryOne, I as getDb, H as getCustomerOutstanding, a3 as getUserBranchIds, aC as query, bb as userCanAction, A as ACCOUNTS_ROLES, S as SALES_ROLES, R as RUNNING_BALANCE_SQL } from '../../../../nitro/nitro.mjs';
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

const NOT_SALE = `('draft','cancelled','rejected')`;
const DISPATCHED = `('goods_on_board','shipped','dispatched','delivered','completed')`;
const profile_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid customer ID" });
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = String((_b = session.user.role) != null ? _b : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const customer = await queryOne(`SELECT * FROM customers WHERE id = ?`, [id]);
  if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });
  const conn = await getDb().getConnection();
  let exposure, branchIds;
  try {
    exposure = await getCustomerOutstanding(conn, id);
    branchIds = await getUserBranchIds(conn, userId, role);
  } finally {
    conn.release();
  }
  const scopeSql = branchIds ? " AND o.assigned_branch_id IN (?)" : "";
  const scopeP = branchIds ? [branchIds] : [];
  const [reviewAgg, ledgerTot, stats, paidAgg, lastPay, ageing, monthly, orders, ledger, payments, returns, amendments, products, notes, wf] = await Promise.all([
    queryOne(`SELECT COUNT(*) n, COALESCE(SUM(debit_amount - credit_amount), 0) net FROM customer_ledger WHERE customer_id = ? AND review_status = 'review'`, [id]),
    queryOne(`SELECT COALESCE(SUM(debit_amount),0) d, COALESCE(SUM(credit_amount),0) c FROM customer_ledger WHERE customer_id = ?`, [id]),
    queryOne(
      `SELECT COUNT(*) orders, COALESCE(SUM(o.total_amount),0) sales, COALESCE(AVG(o.total_amount),0) avg_order,
              MIN(o.order_date) first_order, MAX(o.order_date) last_order,
              SUM(o.status NOT IN ('delivered','completed','cancelled','rejected','draft')) open_orders
       FROM credit_orders o WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}`,
      [id, ...scopeP]
    ),
    queryOne(`SELECT COALESCE(SUM(amount),0) paid, COUNT(*) n FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL`, [id]),
    queryOne(`SELECT payment_date, amount, payment_method FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL ORDER BY payment_date DESC, id DESC LIMIT 1`, [id]),
    queryOne(
      `SELECT COALESCE(SUM(CASE WHEN d <= 30 THEN b END),0) d0, COALESCE(SUM(CASE WHEN d BETWEEN 31 AND 60 THEN b END),0) d31,
              COALESCE(SUM(CASE WHEN d BETWEEN 61 AND 90 THEN b END),0) d61, COALESCE(SUM(CASE WHEN d > 90 THEN b END),0) d90
       FROM (SELECT o.balance_due b, DATEDIFF(CURDATE(), o.order_date) d FROM credit_orders o
             WHERE o.customer_id = ? AND o.balance_due > 0 AND o.status IN ${DISPATCHED}${scopeSql}) x`,
      [id, ...scopeP]
    ),
    query(
      `SELECT DATE_FORMAT(o.order_date,'%Y-%m') m, COALESCE(SUM(o.total_amount),0) total, COUNT(*) n
       FROM credit_orders o WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}
         AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH) - INTERVAL (DAY(CURDATE()) - 1) DAY
       GROUP BY m ORDER BY m`,
      [id, ...scopeP]
    ),
    query(
      `SELECT o.id, o.order_number, o.order_date, o.required_date, o.status, o.total_amount, (o.amount_paid + o.advance_paid) AS amount_paid, o.balance_due,
              o.delivery_type, b.name branch_name
       FROM credit_orders o LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY o.order_date DESC, o.id DESC LIMIT 300`,
      [id, ...scopeP]
    ),
    query(
      `SELECT * FROM (
         SELECT l.id, DATE_FORMAT(l.transaction_date, '%Y-%m-%d') date, l.transaction_type type, COALESCE(l.invoice_number, l.reference_id) ref, l.description,
                l.debit_amount debit, l.credit_amount credit, ${RUNNING_BALANCE_SQL} balance, l.reference_type, l.reference_id, l.review_status, l.review_reason, l.review_note,
                COALESCE(CASE WHEN l.reference_type IN ('credit_order','credit_orders') THEN l.reference_id END, ret.order_id, amd.order_id) linked_order_id
         FROM customer_ledger l
         LEFT JOIN credit_order_returns ret ON l.reference_type = 'credit_order_return' AND ret.id = l.reference_id
         LEFT JOIN order_amendments amd ON l.reference_type = 'order_amendment' AND amd.id = l.reference_id
         WHERE l.customer_id = ?
       ) t ORDER BY t.date DESC, t.id DESC LIMIT 300`,
      [id]
    ),
    query(
      `SELECT p.id, p.payment_number, p.receipt_number, p.payment_date, p.amount, p.payment_method, p.reference_number, p.notes,
              p.allocation_status, p.reversed_at, p.order_id, u.display_name collected_by
       FROM customer_payments p LEFT JOIN users u ON u.id = p.created_by_user_id
       WHERE p.customer_id = ? ORDER BY p.payment_date DESC, p.id DESC LIMIT 300`,
      [id]
    ),
    query(
      `SELECT r.id, r.return_number, r.order_id, o.order_number, r.return_date, r.total_returned_amount, r.status, r.return_reason
       FROM credit_order_returns r JOIN credit_orders o ON o.id = r.order_id
       WHERE r.customer_id = ?${scopeSql} ORDER BY r.id DESC LIMIT 100`,
      [id, ...scopeP]
    ),
    query(
      `SELECT a.id, a.amendment_number, a.order_id, o.order_number, a.regime, a.amend_type, a.flat_amount, a.status, a.description, a.created_at
       FROM order_amendments a JOIN credit_orders o ON o.id = a.order_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY a.id DESC LIMIT 100`,
      [id, ...scopeP]
    ),
    query(
      `SELECT COALESCE(p.base_name, 'Item') product, pv.weight_variant, pv.grade, SUM(i.quantity) qty, SUM(i.line_total) amount,
              COUNT(DISTINCT o.id) orders, MAX(o.order_date) last_order
       FROM credit_order_items i JOIN credit_orders o ON o.id = i.order_id
       LEFT JOIN products p ON p.id = i.product_id LEFT JOIN product_variants pv ON pv.id = i.variant_id
       WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}
       GROUP BY i.product_id, i.variant_id, p.base_name, pv.weight_variant, pv.grade
       ORDER BY amount DESC LIMIT 25`,
      [id, ...scopeP]
    ),
    query(
      `SELECT n.id, n.note, n.kind, n.created_at, n.created_by_user_id, u.display_name author
       FROM customer_notes n LEFT JOIN users u ON u.id = n.created_by_user_id
       WHERE n.customer_id = ? ORDER BY n.id DESC LIMIT 100`,
      [id]
    ).catch(() => []),
    query(
      `SELECT w.id, o.id order_id, o.order_number, w.to_status, w.action, w.comments, w.performed_at, u.display_name author
       FROM credit_order_workflow w JOIN credit_orders o ON o.id = w.order_id
       LEFT JOIN users u ON u.id = w.performed_by_user_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY w.performed_at DESC, w.id DESC LIMIT 40`,
      [id, ...scopeP]
    )
  ]);
  const limit = Number((_c = customer.credit_limit) != null ? _c : 0);
  const totalExposure = exposure.totalExposure;
  const credit = {
    limit,
    outstanding: exposure.ledgerOutstanding,
    pending: exposure.pendingExposure,
    exposure: totalExposure,
    available: Math.max(0, limit - totalExposure),
    usagePct: limit > 0 ? Math.round(totalExposure / limit * 100) : totalExposure > 0 ? 999 : 0,
    storedBalance: Number((_d = customer.current_balance) != null ? _d : 0)
  };
  const activity = [
    ...wf.map((w) => ({
      at: w.performed_at,
      kind: "order",
      icon: "\u{1F4CB}",
      title: `${w.order_number} \u2192 ${String(w.to_status).replace(/_/g, " ")}`,
      detail: w.comments,
      by: w.author,
      order_id: w.order_id
    })),
    ...payments.slice(0, 15).map((p) => {
      var _a2, _b2;
      return {
        at: (_a2 = p.created_at) != null ? _a2 : p.payment_date,
        kind: "payment",
        icon: p.reversed_at ? "\u21A9\uFE0F" : "\u{1F4B0}",
        title: `${p.reversed_at ? "Reversed " : ""}payment \u09F3${Number(p.amount).toLocaleString()} (${(_b2 = p.payment_method) != null ? _b2 : "\u2014"})`,
        detail: p.notes,
        by: p.collected_by
      };
    }),
    ...notes.map((n) => ({ at: n.created_at, kind: n.kind, icon: n.kind === "status" ? "\u{1F6A6}" : "\u{1F4DD}", title: n.kind === "status" ? "Status change" : "Note", detail: n.note, by: n.author }))
  ].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 50);
  const can = {
    createOrder: await userCanAction({ userId, role, module: "credit_sales", page: "all", action: "create", roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES] }),
    collect: await userCanAction({ userId, role, module: "credit_sales", page: "all", action: "collect_payment", roleFallback: [...ACCOUNTS_ROLES, "collector"] }),
    edit: await userCanAction({ userId, role, module: "customers", page: "list", action: "edit", roleFallback: ACCOUNTS_ROLES }),
    status: await userCanAction({ userId, role, module: "customers", page: "list", action: "blacklist", roleFallback: ACCOUNTS_ROLES }),
    creditLimit: await userCanAction({ userId, role, module: "credit_sales", page: "credit-limits", action: "update", roleFallback: ACCOUNTS_ROLES }),
    delete: isAdmin,
    notes: true,
    reviewLedger: await userCanAction({ userId, role, module: "customers", page: "list", action: "review_ledger", roleFallback: [], explicit: true })
  };
  return {
    customer,
    credit,
    can,
    stats: { ...stats, paid: Number((_e = paidAgg == null ? void 0 : paidAgg.paid) != null ? _e : 0), payments: Number((_f = paidAgg == null ? void 0 : paidAgg.n) != null ? _f : 0), lastPayment: lastPay != null ? lastPay : null },
    ledgerTotals: { debit: Number((_g = ledgerTot == null ? void 0 : ledgerTot.d) != null ? _g : 0), credit: Number((_h = ledgerTot == null ? void 0 : ledgerTot.c) != null ? _h : 0) },
    review: { flagged: Number((_i = reviewAgg == null ? void 0 : reviewAgg.n) != null ? _i : 0), net: Number((_j = reviewAgg == null ? void 0 : reviewAgg.net) != null ? _j : 0), balanceWithoutFlagged: credit.outstanding - Number((_k = reviewAgg == null ? void 0 : reviewAgg.net) != null ? _k : 0) },
    ageing,
    monthly,
    orders,
    ledger,
    payments,
    returns,
    amendments,
    products,
    notes,
    activity,
    branchLimited: !!branchIds
  };
});

export { profile_get as default };
//# sourceMappingURL=profile.get.mjs.map
