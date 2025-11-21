import { verifyToken, extractBearerToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only protect /api/admin/* routes
  if (!url.pathname.startsWith('/api/admin')) {
    return
  }

  // Extract token from Authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = extractBearerToken(authHeader || null)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  try {
    // Verify token
    const payload = await verifyToken(token)

    // Attach user info to event context
    event.context.auth = {
      email: payload.email
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
})
