import { agentStatus } from '~/server/utils/crmAgent'

/** GET /api/crm/agent-status — is the assistant on, does the server have a key, how much has been used today. (Never returns the key.) */
export default defineEventHandler(async () => agentStatus())
