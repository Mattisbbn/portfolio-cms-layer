import { db } from '../../utils/db'
import { pages } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug de la page requis.'
    })
  }

  const page = await db.select().from(pages).where(eq(pages.slug, slug)).get()

  if (!page) {
    throw createError({
      statusCode: 404,
      message: `La page avec le slug "${slug}" n'existe pas.`
    })
  }

  return page
})
