import { defineConfig } from 'drizzle-kit'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  schema: resolve(__dirname, './server/database/schema.ts').replace(/\\/g, '/'),
  out: resolve(__dirname, './server/database/migrations').replace(/\\/g, '/'),
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db',
  }
})