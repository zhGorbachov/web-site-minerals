import bcrypt from 'bcryptjs'
import { env } from './env.js'
import { isValidPhone, normalizePhone } from './auth.js'
import { prisma } from './prisma.js'

async function ensureCart(userId: string) {
  await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })
}

/**
 * Ensures the configured operator exists as an admin on every API start.
 * Password from env is the source of truth (overwritten on restart).
 */
export async function ensureBootstrapAdmin() {
  const phone = normalizePhone(env.adminPhone)
  if (!isValidPhone(phone) || !env.adminPassword) {
    console.warn('Skipping admin bootstrap: ADMIN_PHONE / ADMIN_PASSWORD are invalid')
    return
  }

  const email = env.adminEmail || null
  const passwordHash = await bcrypt.hash(env.adminPassword, 10)
  const profile = {
    phone,
    passwordHash,
    role: 'admin' as const,
    firstName: env.adminFirstName,
    lastName: env.adminLastName,
    provider: 'email' as const,
  }

  const byPhone = await prisma.user.findUnique({ where: { phone } })
  const byEmail = email ? await prisma.user.findUnique({ where: { email } }) : null

  let userId: string

  if (byPhone) {
    await prisma.user.update({
      where: { id: byPhone.id },
      data: {
        ...profile,
        email: byPhone.email ?? (byEmail && byEmail.id !== byPhone.id ? null : email),
      },
    })
    userId = byPhone.id
  } else if (byEmail) {
    await prisma.user.update({
      where: { id: byEmail.id },
      data: profile,
    })
    userId = byEmail.id
  } else {
    const created = await prisma.user.create({
      data: { ...profile, email },
    })
    userId = created.id
  }

  await ensureCart(userId)
  console.log(`Bootstrap admin ready: +38 ${phone}`)
}
