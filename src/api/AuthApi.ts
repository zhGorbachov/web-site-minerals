import { api, setAuthToken, getAuthToken } from './client'
import type { User } from '@/types'

export type AuthResponse = {
  token: string
  user: User
}

export const AuthApi = {
  async register(payload: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }) {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    setAuthToken(data.token)
    return data
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
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

  googleStartUrl() {
    const base = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:3001'
    return `${base}/api/auth/google`
  },

  appleStartUrl() {
    const base = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:3001'
    return `${base}/api/auth/apple`
  },
}
