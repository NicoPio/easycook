/**
 * Authentication middleware
 * Protects /api/admin/* routes with JWT verification
 */

import { verifyToken, extractTokenFromHeader } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const path = event.path

  // Only protect /api/admin/* routes (except login)
  if (!path.startsWith('/api/admin') || path === '/api/auth/login') {
    return
  }

  // Extract token from Authorization header
  const authorization = getHeader(event, 'Authorization')
  const token = extractTokenFromHeader(authorization)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid authorization token',
    })
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }

  // Attach user info to event context for use in handlers
  event.context.auth = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  }
})
