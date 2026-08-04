import { q as defineEventHandler, X as getUserSession, m as createError, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const partners_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const partners = await query(
    `SELECT bp.id, bp.name, bp.notes, bp.created_at,
            c.id AS customer_id, c.name AS customer_name,
            s.id AS supplier_id, s.company_name AS supplier_name,
            COALESCE((SELECT SUM(cl.debit_amount) - SUM(cl.credit_amount)
              FROM customer_ledger cl WHERE cl.customer_id = c.id), 0) AS receivable,
            COALESCE(s.current_balance, 0) AS payable
     FROM business_partners bp
     LEFT JOIN customers c ON c.business_partner_id = bp.id
     LEFT JOIN suppliers s ON s.business_partner_id = bp.id
     ORDER BY bp.name`
  );
  const [customers, suppliers] = await Promise.all([
    query(
      `SELECT id, name, phone_number FROM customers
       WHERE business_partner_id IS NULL AND status = 'active' ORDER BY name LIMIT 500`
    ),
    query(
      `SELECT id, company_name AS name, phone
       FROM suppliers WHERE business_partner_id IS NULL ORDER BY company_name LIMIT 500`
    )
  ]);
  return { partners: partners.filter((p) => p.customer_id || p.supplier_id), customers, suppliers };
});

export { partners_get as default };
//# sourceMappingURL=partners.get.mjs.map
