import { db } from '../../../utils/db'
import { pages } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de la page requis.'
    })
  }

  const page = await db.select().from(pages).where(eq(pages.id, id)).get()
  if (!page) {
    throw createError({
      statusCode: 404,
      message: 'Page non trouvée.'
    })
  }

  return page
})
