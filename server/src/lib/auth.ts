import type { AuthProvider, User, UserRole } from '@prisma/client'
import type { Request, Response, NextFunction } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from './env.js'
import { prisma } from './prisma.js'

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  provider: AuthProvider
  createdAt: string
}

export type JwtPayload = {
  sub: string
  email: string
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
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    provider: user.provider,
    createdAt: user.createdAt.toISOString(),
  }
}

export function signToken(user: Pick<User, 'id' | 'email'>) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  }
  return jwt.sign({ sub: user.id, email: user.email } satisfies JwtPayload, env.jwtSecret, options)
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
