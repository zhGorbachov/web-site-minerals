import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { env, isAppleConfigured, isGoogleConfigured } from '../lib/env.js'
import {
  isValidPhone,
  normalizePhone,
  requireAuth,
  signToken,
  toPublicUser,
} from '../lib/auth.js'
import { sendVerificationSms } from '../lib/sms.js'

export const authRouter = Router()

const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal('')),
  password: z.string().min(6),
})

const loginSchema = z.object({
  phone: z.string().trim().min(1).optional(),
  login: z.string().trim().min(1).optional(),
  password: z.string().min(1),
})

const codeSchema = z.object({
  phone: z.string().trim().min(1),
  code: z.string().regex(/^\d{4}$/),
})

const resetPasswordSchema = codeSchema.extend({
  password: z.string().min(6),
})

const verificationSelect = {
  id: true,
  phone: true,
  purpose: true,
  codeHash: true,
  payload: true,
  attempts: true,
  sentAt: true,
  expiresAt: true,
} as const

function randomState() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString('hex')
}

function parsePhone(value: string) {
  const phone = normalizePhone(value)
  return isValidPhone(phone) ? phone : null
}

async function issueCode(
  phone: string,
  purpose: 'register' | 'password_reset',
  payload?: Record<string, string | null>,
) {
  const existing = await prisma.phoneVerification.findUnique({
    where: { phone_purpose: { phone, purpose } },
    select: verificationSelect,
  })
  const now = new Date()
  if (
    existing &&
    now.getTime() - existing.sentAt.getTime() < env.otpResendCooldownSeconds * 1000
  ) {
    return 'too_soon' as const
  }

  const code = String(Math.floor(Math.random() * 10_000)).padStart(4, '0')
  const codeHash = await bcrypt.hash(code, 10)
  await prisma.phoneVerification.upsert({
    where: { phone_purpose: { phone, purpose } },
    create: {
      phone,
      purpose,
      codeHash,
      payload,
      expiresAt: new Date(now.getTime() + env.otpTtlMinutes * 60_000),
    },
    update: {
      codeHash,
      payload,
      attempts: 0,
      sentAt: now,
      expiresAt: new Date(now.getTime() + env.otpTtlMinutes * 60_000),
    },
  })

  try {
    await sendVerificationSms(phone, code)
  } catch (error) {
    await prisma.phoneVerification.delete({
      where: { phone_purpose: { phone, purpose } },
    })
    throw error
  }
  return 'sent' as const
}

async function verifyCode(phone: string, purpose: 'register' | 'password_reset', code: string) {
  const verification = await prisma.phoneVerification.findUnique({
    where: { phone_purpose: { phone, purpose } },
    select: verificationSelect,
  })
  if (!verification || verification.expiresAt < new Date()) return { error: 'code_expired' as const }
  if (verification.attempts >= env.otpMaxAttempts) return { error: 'too_many_attempts' as const }

  const valid = await bcrypt.compare(code, verification.codeHash)
  if (!valid) {
    await prisma.phoneVerification.update({
      where: { phone_purpose: { phone, purpose } },
      data: { attempts: { increment: 1 } },
    })
    return { error: 'invalid_code' as const }
  }
  return { verification }
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  const phone = parsePhone(parsed.data.phone)
  if (!phone) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }

  const email = parsed.data.email?.trim().toLowerCase() || null

  const existingPhone = await prisma.user.findUnique({ where: { phone } })
  if (existingPhone) {
    res.status(409).json({ error: 'phone_taken' })
    return
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      res.status(409).json({ error: 'email_taken' })
      return
    }
  }

  try {
    const result = await issueCode(phone, 'register', {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    })
    if (result === 'too_soon') {
      res.status(429).json({ error: 'code_send_too_soon' })
      return
    }
    res.status(202).json({ ok: true })
  } catch (error) {
    console.error('[auth/register] SMS send failed', error)
    res.status(502).json({ error: 'sms_send_failed' })
  }
})

authRouter.post('/register/verify', async (req, res) => {
  const parsed = codeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_code' })
    return
  }
  const phone = parsePhone(parsed.data.phone)
  if (!phone) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }
  const result = await verifyCode(phone, 'register', parsed.data.code)
  if ('error' in result) {
    res.status(result.error === 'too_many_attempts' ? 429 : 400).json(result)
    return
  }
  const payload = result.verification.payload as {
    firstName?: string
    lastName?: string
    email?: string | null
    passwordHash?: string
  } | null
  if (!payload?.firstName || !payload.lastName || !payload.passwordHash) {
    res.status(400).json({ error: 'code_expired' })
    return
  }
  const { firstName, lastName, passwordHash, email: registrationEmail } = payload

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          firstName,
          lastName,
          phone,
          email: registrationEmail ?? null,
          passwordHash,
          provider: 'email',
        },
      })
      await tx.cart.create({ data: { userId: created.id } })
      await tx.phoneVerification.delete({ where: { phone_purpose: { phone, purpose: 'register' } } })
      return created
    })
    res.status(201).json({ token: signToken(user), user: toPublicUser(user) })
  } catch {
    res.status(409).json({ error: 'phone_taken' })
  }
})

authRouter.post('/password/forgot', async (req, res) => {
  const parsed = z.object({ phone: z.string().trim().min(1) }).safeParse(req.body)
  const phone = parsed.success ? parsePhone(parsed.data.phone) : null
  if (!phone) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }
  const user = await prisma.user.findUnique({ where: { phone } })
  // Do not disclose whether a phone has an account or supports passwords.
  if (!user?.passwordHash) {
    res.status(202).json({ ok: true })
    return
  }
  try {
    const result = await issueCode(phone, 'password_reset')
    if (result === 'too_soon') {
      res.status(429).json({ error: 'code_send_too_soon' })
      return
    }
    res.status(202).json({ ok: true })
  } catch (error) {
    console.error('[auth/password/forgot] SMS send failed', error)
    res.status(502).json({ error: 'sms_send_failed' })
  }
})

authRouter.post('/password/reset', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }
  const phone = parsePhone(parsed.data.phone)
  if (!phone) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }
  const result = await verifyCode(phone, 'password_reset', parsed.data.code)
  if ('error' in result) {
    res.status(result.error === 'too_many_attempts' ? 429 : 400).json(result)
    return
  }
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user?.passwordHash) {
    res.status(400).json({ error: 'invalid_credentials' })
    return
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    }),
    prisma.phoneVerification.delete({ where: { phone_purpose: { phone, purpose: 'password_reset' } } }),
  ])
  res.json({ ok: true })
})

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const rawPhone = (parsed.data.phone || parsed.data.login || '').trim()
  if (!rawPhone) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const phone = normalizePhone(rawPhone)
  if (!isValidPhone(phone)) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }

  const user = await prisma.user.findUnique({ where: { phone } })

  if (!user?.passwordHash) {
    res.status(401).json({ error: 'invalid_credentials' })
    return
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) {
    res.status(401).json({ error: 'invalid_credentials' })
    return
  }

  const token = signToken(user)
  res.json({ token, user: toPublicUser(user) })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user: toPublicUser(user) })
})

authRouter.get('/google', (req, res) => {
  if (!isGoogleConfigured()) {
    res.redirect(`${env.clientUrl}/login?error=oauth_not_configured`)
    return
  }

  const state = randomState()
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: `${env.apiUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
    access_type: 'online',
  })

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

authRouter.get('/google/callback', async (req, res) => {
  if (!isGoogleConfigured()) {
    res.redirect(`${env.clientUrl}/login?error=oauth_not_configured`)
    return
  }

  const { code, state, error } = req.query
  const cookieState = req.cookies?.oauth_state as string | undefined
  res.clearCookie('oauth_state')

  if (error || !code || typeof code !== 'string') {
    res.redirect(`${env.clientUrl}/login?error=oauth_denied`)
    return
  }

  if (!state || !cookieState || state !== cookieState) {
    res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: `${env.apiUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
      return
    }

    const tokens = (await tokenRes.json()) as { access_token?: string; id_token?: string }
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!profileRes.ok) {
      res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
      return
    }

    const profile = (await profileRes.json()) as {
      sub: string
      email?: string
      given_name?: string
      family_name?: string
      name?: string
    }

    if (!profile.email) {
      res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
      return
    }

    const email = profile.email.toLowerCase()
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { provider: 'google', providerUserId: profile.sub }],
      },
    })

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerUserId: profile.sub,
          firstName: profile.given_name || user.firstName,
          lastName: profile.family_name || user.lastName,
          email,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
          lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || 'Google',
          provider: 'google',
          providerUserId: profile.sub,
        },
      })
      await prisma.cart.create({ data: { userId: user.id } })
    }

    const token = signToken(user)
    res.redirect(`${env.clientUrl}/auth/callback?token=${encodeURIComponent(token)}`)
  } catch {
    res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
  }
})

authRouter.get('/apple', (req, res) => {
  if (!isAppleConfigured()) {
    res.redirect(`${env.clientUrl}/login?error=oauth_not_configured`)
    return
  }

  const state = randomState()
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: env.appleClientId,
    redirect_uri: `${env.apiUrl}/api/auth/apple/callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  })

  res.redirect(`https://appleid.apple.com/auth/authorize?${params.toString()}`)
})

authRouter.post('/apple/callback', async (req, res) => {
  if (!isAppleConfigured()) {
    res.redirect(`${env.clientUrl}/login?error=oauth_not_configured`)
    return
  }

  const { id_token: idToken, state, error, user: userJson } = req.body as {
    id_token?: string
    state?: string
    error?: string
    user?: string
  }

  const cookieState = req.cookies?.oauth_state as string | undefined
  res.clearCookie('oauth_state')

  if (error || !idToken) {
    res.redirect(`${env.clientUrl}/login?error=oauth_denied`)
    return
  }

  if (!state || !cookieState || state !== cookieState) {
    res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
    return
  }

  try {
    const [, payloadB64] = idToken.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      sub: string
      email?: string
    }

    if (!payload.email) {
      res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
      return
    }

    let firstName = 'User'
    let lastName = 'Apple'
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson) as {
          name?: { firstName?: string; lastName?: string }
        }
        firstName = parsed.name?.firstName || firstName
        lastName = parsed.name?.lastName || lastName
      } catch {
        // ignore
      }
    }

    const email = payload.email.toLowerCase()
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { provider: 'apple', providerUserId: payload.sub }],
      },
    })

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'apple',
          providerUserId: payload.sub,
          email,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          provider: 'apple',
          providerUserId: payload.sub,
        },
      })
      await prisma.cart.create({ data: { userId: user.id } })
    }

    const token = signToken(user)
    res.redirect(`${env.clientUrl}/auth/callback?token=${encodeURIComponent(token)}`)
  } catch {
    res.redirect(`${env.clientUrl}/login?error=oauth_failed`)
  }
})
