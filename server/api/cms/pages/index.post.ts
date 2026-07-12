import { db } from '../../../utils/db'
import { pages } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

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
  const body = await readBody(event)

  if (!body || !body.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le titre de la page est requis.'
    })
  }

  if (!body.slug || typeof body.slug !== 'string' || !body.slug.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le slug URL de la page est requis.'
    })
  }

  const title = body.title.trim()
  let slug = body.slug.trim()
  if (slug !== '/') {
    slug = generateSlug(slug)
  }

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Le slug URL de la page est invalide.'
    })
  }

  // Ensure slug is unique
  const existing = await db.select().from(pages).where(eq(pages.slug, slug)).get()
  if (existing) {
    throw createError({
      statusCode: 400,
      message: `Le slug URL "${slug}" est déjà utilisé par une autre page.`
    })
  }

  // Calculate next order
  const allPages = await db.select().from(pages)
  const nextOrder = allPages.length > 0 ? Math.max(...allPages.map((p) => p.order)) + 1 : 0

  const newPage = {
    id: randomUUID(),
    title,
    slug,
    blocks: [],
    order: nextOrder,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await db.insert(pages).values(newPage)
  return newPage
})
