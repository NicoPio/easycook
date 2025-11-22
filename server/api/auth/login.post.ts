import { signToken } from '../../utils/jwt'

interface LoginRequest {
  email: string
  password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequest>(event)

  // Validate input
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@easycook.app'
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // Check if admin credentials are configured
  if (!adminPasswordHash) {
    throw createError({
      statusCode: 500,
      message: 'Admin credentials not configured'
    })
  }

  // Verify email
  if (body.email !== adminEmail) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // In production, use bcrypt to compare password hash
  // For now, we'll do a simple comparison (THIS IS NOT SECURE FOR PRODUCTION)
  // TODO: Install bcrypt and use proper password hashing
  // const bcrypt = await import('bcrypt')
  // const isValid = await bcrypt.compare(body.password, adminPasswordHash)

  // Temporary simple check (REPLACE IN PRODUCTION)
  const isValid = body.password === adminPasswordHash

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Generate JWT token
  const token = await signToken({
    email: body.email
  })

  return {
    token,
    expiresIn: 86400 // 24 hours in seconds
  }
})
