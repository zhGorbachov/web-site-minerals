import 'dotenv/config'

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const clientUrlRaw = required('CLIENT_URL', 'http://localhost:5174')

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Primary client origin (first entry). */
  clientUrl: clientUrlRaw.split(',')[0]!.trim(),
  /** All allowed CORS origins (comma-separated CLIENT_URL). */
  clientOrigins: clientUrlRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'dev-change-me-minerals-jwt-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '',
  appleClientId: process.env.APPLE_CLIENT_ID?.trim() ?? '',
  apiUrl: process.env.API_URL?.trim() || `http://localhost:${process.env.PORT ?? 3001}`,
  novaPoshtaApiKey: process.env.NOVA_POSHTA_API_KEY?.trim() ?? '',
  liqpayPublicKey: process.env.LIQPAY_PUBLIC_KEY?.trim() ?? '',
  liqpayPrivateKey: process.env.LIQPAY_PRIVATE_KEY?.trim() ?? '',
  turboSmsToken: process.env.TURBOSMS_TOKEN?.trim() ?? '',
  turboSmsSender: process.env.TURBOSMS_SENDER?.trim() || 'LuxStones',
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES ?? 10),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
  otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60),
}

export function isGoogleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret)
}

export function isAppleConfigured() {
  return Boolean(env.appleClientId)
}

export function isLiqPayConfigured() {
  return Boolean(env.liqpayPublicKey && env.liqpayPrivateKey)
}
