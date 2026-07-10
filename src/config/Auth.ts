export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
export const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID?.trim() ?? ''

export const GOOGLE_REDIRECT_PATH = '/auth/google/callback'
export const APPLE_REDIRECT_PATH = '/auth/apple/callback'

export function getOAuthRedirectUri(path: string) {
  return `${window.location.origin}${path}`
}

export function isGoogleAuthConfigured() {
  return GOOGLE_CLIENT_ID.length > 0
}

export function isAppleAuthConfigured() {
  return APPLE_CLIENT_ID.length > 0
}
