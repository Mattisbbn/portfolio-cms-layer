import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// // Table des Collections (ex: "Projets Web")
// export const collections = sqliteTable('collections', {
//   id: text('id').primaryKey(), // On mettra des UUID ou des nanoid
//   name: text('name').notNull(),
//   slug: text('slug').notNull().unique(),
//   createdAt: integer('created_at', { mode: 'timestamp' }) // SQLite gère les dates en integer
// })

// Table des Pages/Items (ex: "Mon Portfolio V1")
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  blocks: text('blocks', { mode: 'json' }).$type<any[]>(), 
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
})