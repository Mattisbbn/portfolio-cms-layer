import { eq } from 'drizzle-orm'
import { db } from './db'
import { pages } from '../database/schema'

/**
 * Récupère une page du CMS par son slug.
 */
export async function getCmsPageBySlug(slug: string) {
  return await db.select().from(pages).where(eq(pages.slug, slug)).get()
}

/**
 * Récupère toutes les pages du CMS ordonnées.
 */
export async function getAllCmsPages() {
  return await db.select().from(pages).orderBy(pages.order).all()
}
