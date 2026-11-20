import { buildOrderReport } from '~/server/utils/orderReports'

/** GET /api/production/dispatch-report?date_from&date_to&branch_id&status=shipped,goods_on_board,delivered */
export default defineEventHandler((event) => buildOrderReport(event, 'dispatch'))
