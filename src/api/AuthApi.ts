import { api, setAuthToken, getAuthToken, isMockMode } from './client'
import type { User } from '@/types'

export type AuthResponse = {
  token: string
  user: User
}

export const AuthApi = {
  async register(payload: {
    firstName: string
    lastName: string
    phone: string
    password: string
  }) {
    await api.post('/auth/register', payload)
  },

  async verifyRegistration(payload: { phone: string; code: string }) {
    const { data } = await api.post<AuthResponse>('/auth/register/verify', payload)
    setAuthToken(data.token)
    return data
  },

  async forgotPassword(payload: { phone: string }) {
    await api.post('/auth/password/forgot', payload)
  },

  async resetPassword(payload: { phone: string; code: string; password: string }) {
    await api.post('/auth/password/reset', payload)
  },

  async login(payload: { phone: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      phone: payload.phone,
      password: payload.password,
    })
    setAuthToken(data.token)
    return data
  },

  async me() {
    const token = getAuthToken()
    if (!token) return null
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data.user
  },

  logout() {
    setAuthToken(null)
  },

  /** Live: redirect URL. Mock: handled by loginWithGoogle(). */
  googleStartUrl() {
    if (isMockMode) return ''
    const base = api.defaults.baseURL?.replace(/\/api$/, '') ?? ''
    return `${base}/api/auth/google`
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    throw new Error('Google login is only available via OAuth redirect in live mode')
  },
}
