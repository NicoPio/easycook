/**
 * POST /api/auth/login
 * Admin authentication endpoint
 */

import bcrypt from 'bcrypt'
import { signToken, getTokenExpiration } from '../../utils/jwt'
import type { LoginRequest, LoginResponse } from '../../../types/api'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const config = useRuntimeConfig()
  const body = await readBody<LoginRequest>(event)

  // Validate input
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Email and password are required',
    })
  }

  // Check credentials against environment variables
  const adminEmail = config.adminEmail
  const adminPasswordHash = config.adminPasswordHash

  if (!adminPasswordHash) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Admin account not configured',
    })
  }

  // Verify email
  if (body.email !== adminEmail) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid credentials',
    })
  }

  // Verify password with bcrypt
  const isValidPassword = await bcrypt.compare(
    body.password,
    adminPasswordHash
  )

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid credentials',
    })
  }

  // Generate JWT token
  const token = await signToken({
    userId: 'admin',
    email: adminEmail,
    role: 'admin',
  })

  return {
    token,
    expiresAt: getTokenExpiration(),
  }
})
