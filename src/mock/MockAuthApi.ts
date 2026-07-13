import type { User } from '@/types'
import { getAuthToken, setAuthToken } from '@/api/client'
import type { AuthResponse } from '@/api/AuthApi'
import { MockApiError } from './MockApiError'
import { isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { MockDb } from './MockDb'

const GOOGLE_DEMO_EMAIL = 'google.demo@luxstones.local'

export const MockAuthApi = {
  async register(payload: {
    firstName: string
    lastName: string
    phone: string
    password: string
  }): Promise<AuthResponse> {
    const phone = normalizeLocalPhone(payload.phone)
    if (!isValidLocalPhone(phone)) throw new MockApiError(400, 'invalid_phone')
    if (MockDb.findUserByPhone(phone)) throw new MockApiError(409, 'phone_taken')

    const user: User = {
      id: `user-${Date.now()}`,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone,
      role: 'customer',
      provider: 'email',
      discountPercent: null,
      discountLabel: null,
      createdAt: new Date().toISOString(),
    }

    MockDb.addUser({ password: payload.password, user })
    const token = MockDb.createSession(user.id)
    setAuthToken(token)
    return { token, user }
  },

  async login(payload: { phone: string; password: string }): Promise<AuthResponse> {
    const phone = normalizeLocalPhone(payload.phone)
    if (!isValidLocalPhone(phone)) throw new MockApiError(400, 'invalid_phone')

    const record = MockDb.findUserByPhone(phone)
    if (!record || record.password !== payload.password) {
      throw new MockApiError(401, 'invalid_credentials')
    }
    const token = MockDb.createSession(record.user.id)
    setAuthToken(token)
    return { token, user: record.user }
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    let record = MockDb.findUserByEmail(GOOGLE_DEMO_EMAIL)
    if (!record) {
      const user: User = {
        id: 'user-google-demo',
        firstName: 'Google',
        lastName: 'User',
        email: GOOGLE_DEMO_EMAIL,
        role: 'customer',
        provider: 'google',
        discountPercent: null,
        discountLabel: null,
        createdAt: new Date().toISOString(),
      }
      MockDb.addUser({ password: '', user })
      record = MockDb.findUserByEmail(GOOGLE_DEMO_EMAIL)!
    }

    const token = MockDb.createSession(record.user.id)
    setAuthToken(token)
    return { token, user: record.user }
  },

  async me(): Promise<User | null> {
    const token = getAuthToken()
    if (!token) return null
    const user = MockDb.resolveSession(token)
    if (!user) throw new MockApiError(401, 'unauthorized')
    return user
  },

  logout() {
    MockDb.clearSession(getAuthToken())
    setAuthToken(null)
  },

  googleStartUrl() {
    return ''
  },

  appleStartUrl() {
    return ''
  },
}
