import { db } from '../../../utils/db'
import { pages } from '../../../database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return await db.select().from(pages).orderBy(asc(pages.order))
})
