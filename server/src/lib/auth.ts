import type { AuthProvider, User, UserRole } from '@prisma/client'
import type { Request, Response, NextFunction } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from './env.js'
import { prisma } from './prisma.js'

export type AuthUser = {
  id: string
  email?: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  provider: AuthProvider
  discountPercent?: number | null
  discountLabel?: string | null
  createdAt: string
}

export type JwtPayload = {
  sub: string
  email?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      userId?: string
    }
  }
}

export function toPublicUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? undefined,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? undefined,
    role: user.role,
    provider: user.provider,
    discountPercent: user.discountPercent,
    discountLabel: user.discountLabel,
    createdAt: user.createdAt.toISOString(),
  }
}

export function signToken(user: Pick<User, 'id' | 'email'>) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  }
  return jwt.sign(
    { sub: user.id, email: user.email ?? undefined } satisfies JwtPayload,
    env.jwtSecret,
    options,
  )
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const payload = verifyToken(header.slice(7))
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }

  try {
    const payload = verifyToken(header.slice(7))
    req.userId = payload.sub
    next()
  } catch {
    next()
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const payload = verifyToken(header.slice(7))
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    req.userId = user.id
    req.user = toPublicUser(user)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, '')

  if (digits.startsWith('380')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('38') && digits.length > 9) {
    digits = digits.slice(2)
  }

  if (digits.length === 9 && !digits.startsWith('0')) {
    digits = `0${digits}`
  }

  return digits
}

export function isValidPhone(phone: string) {
  return /^0\d{9}$/.test(normalizePhone(phone))
}
