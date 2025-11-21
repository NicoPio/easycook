import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  email: string
  iat?: number
  exp?: number
}

/**
 * Sign a JWT token
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration (default: 24h)
 */
export async function signToken(payload: JWTPayload, expiresIn = '24h'): Promise<string> {
  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)

  return jwt
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or throws error
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
