import { db } from '../../../utils/db'
import { pages } from '../../../database/schema'
import { eq, and, ne } from 'drizzle-orm'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de la page requis.'
    })
  }

  // Find page
  const page = await db.select().from(pages).where(eq(pages.id, id)).get()
  if (!page) {
    throw createError({
      statusCode: 404,
      message: 'Page non trouvée.'
    })
  }

  const updates: Partial<typeof pages.$inferInsert> = {
    updatedAt: new Date()
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Le titre de la page ne peut pas être vide.'
      })
    }
    updates.title = body.title.trim()
  }

  if (body.blocks !== undefined) {
    updates.blocks = body.blocks
  }

  if (body.slug !== undefined && body.slug !== page.slug) {
    if (typeof body.slug !== 'string' || !body.slug.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Le slug ne peut pas être vide.'
      })
    }
    let cleanSlug = body.slug.trim()
    if (cleanSlug !== '/') {
      cleanSlug = generateSlug(cleanSlug)
    }

    if (!cleanSlug) {
      throw createError({
        statusCode: 400,
        message: 'Le slug URL de la page est invalide.'
      })
    }

    // Check slug uniqueness
    const existing = await db
      .select()
      .from(pages)
      .where(and(eq(pages.slug, cleanSlug), ne(pages.id, id)))
      .get()

    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Ce slug URL est déjà utilisé par une autre page.'
      })
    }

    updates.slug = cleanSlug
  }

  await db.update(pages).set(updates).where(eq(pages.id, id))

  return { success: true }
})
