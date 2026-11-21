import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'
import { phone9 } from '~/server/utils/crmMessaging'

/** POST /api/crm/messages/optout { phone, optout: boolean, reason? } — add a number to (anyone) or remove it from (admin only) the do-not-contact list. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event), p9 = phone9(b?.phone)
  if (p9.length < 8) throw createError({ statusCode: 400, statusMessage: 'Phone number needed' })
  if (b?.optout === false) {
    if (!['admin', 'superadmin'].includes(me.role)) throw createError({ statusCode: 403, statusMessage: 'Only an administrator can remove a number from the do-not-contact list.' })
    await query(`DELETE FROM crm_optout WHERE phone9 = ?`, [p9])
  } else await query(`INSERT IGNORE INTO crm_optout (phone9, reason) VALUES (?, ?)`, [p9, String(b?.reason ?? `added by ${me.name}`).slice(0, 200)])
  return { ok: true }
})
