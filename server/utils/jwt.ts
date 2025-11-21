/**
 * JWT utilities for authentication
 * Uses jose library for secure JWT operations
 */

import { SignJWT, jwtVerify } from 'jose'

interface JwtPayload {
  userId: string
  email: string
  role: 'admin'
}

/**
 * Sign a JWT token
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(secret)

  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const config = useRuntimeConfig()
    const secret = new TextEncoder().encode(config.jwtSecret)

    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin',
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authorization: string | undefined
): string | null {
  if (!authorization) return null

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer' || !token) return null

  return token
}

/**
 * Get token expiration timestamp
 */
export function getTokenExpiration(): number {
  // 7 days from now in seconds
  return Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
}
