import { getAppSettings } from '~/server/utils/appSettings'

/** All company-wide settings groups (company profile, finance, order policy, security policy, notifications). Any signed-in user may read — prints need it. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  return await getAppSettings(true)
})
