import { gatewayStatus } from '~/server/utils/crmMessaging'

/** GET /api/crm/messages/status — which channels are connected and whether sending is switched on. (Never returns any key.) */
export default defineEventHandler(async () => gatewayStatus())
