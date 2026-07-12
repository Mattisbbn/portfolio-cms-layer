import { db } from '../../../utils/db'
import { users } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { verifyUserPassword } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis.'
    })
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email.toLowerCase().trim()))
    .get()

  if (!user || !verifyUserPassword(body.password, user.password)) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect.'
    })
  }

  await setUserSession(event, {
    user: {
      name: user.name,
      email: user.email
    },
    loggedInAt: new Date()
  })

  return { success: true }
})
