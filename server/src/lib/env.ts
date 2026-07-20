import 'dotenv/config'

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  clientUrl: required('CLIENT_URL', 'http://localhost:5174'),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'dev-change-me-minerals-jwt-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '',
  appleClientId: process.env.APPLE_CLIENT_ID?.trim() ?? '',
  apiUrl: process.env.API_URL?.trim() || `http://localhost:${process.env.PORT ?? 3001}`,
  novaPoshtaApiKey: process.env.NOVA_POSHTA_API_KEY?.trim() ?? '',
}

export function isGoogleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret)
}

export function isAppleConfigured() {
  return Boolean(env.appleClientId)
}
