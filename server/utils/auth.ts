import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Hashes a plain password using Node's native scrypt algorithm.
 * Returns a string formatted as "salt:hash".
 */
export function hashUserPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifies a plain password against a stored "salt:hash" password.
 */
export function verifyUserPassword(password: string, stored: string): boolean {
  const parts = stored.split(':')
  if (parts.length !== 2) return false
  const salt = parts[0]
  const hash = parts[1]
  if (!salt || !hash) return false
  const key = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'))
}
