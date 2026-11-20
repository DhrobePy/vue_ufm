import { buildOrderReport } from '~/server/utils/orderReports'

/** GET /api/credit-sales/reports/product-sales?date_from&date_to&branch_id&product — see server/utils/orderReports.ts for the rules (same as legacy). */
export default defineEventHandler((event) => buildOrderReport(event, 'product'))
