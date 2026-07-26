import { query } from '~/server/utils/db'

/**
 * GET /api/trading/partners — linked business partners with combined AR/AP:
 * customer side = ledger truth (SUM debit−credit), supplier side = supplier
 * balance (payable). Also returns unlinked customers/suppliers for the link
 * form, with phone-match suggestions.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const partners = await query<any>(
    `SELECT bp.id, bp.name, bp.notes, bp.created_at,
            c.id AS customer_id, c.name AS customer_name,
            s.id AS supplier_id, s.company_name AS supplier_name,
            COALESCE((SELECT SUM(cl.debit_amount) - SUM(cl.credit_amount)
              FROM customer_ledger cl WHERE cl.customer_id = c.id), 0) AS receivable,
            COALESCE(s.current_balance, 0) AS payable
     FROM business_partners bp
     LEFT JOIN customers c ON c.business_partner_id = bp.id
     LEFT JOIN suppliers s ON s.business_partner_id = bp.id
     ORDER BY bp.name`,
  )

  const [customers, suppliers] = await Promise.all([
    query<any>(
      `SELECT id, name, phone_number FROM customers
       WHERE business_partner_id IS NULL AND status = 'active' ORDER BY name LIMIT 500`,
    ),
    query<any>(
      `SELECT id, company_name AS name, phone
       FROM suppliers WHERE business_partner_id IS NULL ORDER BY company_name LIMIT 500`,
    ),
  ])

  return { partners: partners.filter((p: any) => p.customer_id || p.supplier_id), customers, suppliers }
})
