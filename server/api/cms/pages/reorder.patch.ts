import { db } from '../../../utils/db'
import { pages } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody(event)

  if (!body || !Array.isArray(body.ids)) {
    throw createError({
      statusCode: 400,
      message: 'Format invalide. Un tableau d\'IDs est requis.'
    })
  }

  const ids = body.ids

  // Update in a transaction
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(pages)
        .set({ order: i, updatedAt: new Date() })
        .where(eq(pages.id, ids[i]))
    }
  })

  return { success: true }
})
