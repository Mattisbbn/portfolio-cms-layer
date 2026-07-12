import { db } from '../server/utils/db'
import { users } from '../server/database/schema'
import { hashUserPassword } from '../server/utils/auth'
import { randomUUID } from 'crypto'

async function main() {
  const args = process.argv.slice(2)
  const [name, email, password] = args

  if (!name || !email || !password) {
    console.log('\n❌ Erreur: Paramètres manquants.')
    console.log('Usage: npx tsx scripts/create-user.ts <name> <email> <password>')
    console.log('Exemple: npx tsx scripts/create-user.ts "Admin" "admin@example.com" "password123"\n')
    process.exit(1)
  }

  try {
    const hashedPassword = hashUserPassword(password)
    await db.insert(users).values({
      id: randomUUID(),
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log(`\n✅ Utilisateur créé avec succès: ${name} (${email.toLowerCase().trim()})\n`)
  } catch (err: any) {
    console.error(`\n❌ Erreur lors de la création de l'utilisateur:`, err.message || err)
    process.exit(1)
  }
}

main()
