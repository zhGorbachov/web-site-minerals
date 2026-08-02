import type { User } from '@/types'
import { getAuthToken, setAuthToken } from '@/api/client'
import type { AuthResponse } from '@/api/AuthApi'
import { MockApiError } from './MockApiError'
import { isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { MockDb } from './MockDb'

const GOOGLE_DEMO_EMAIL = 'google.demo@luxstones.local'
const MOCK_OTP_CODE = '1234'
const pendingRegistrations = new Map<
  string,
  { firstName: string; lastName: string; phone: string; password: string }
>()
const passwordResetCodes = new Set<string>()

export const MockAuthApi = {
  async register(payload: {
    firstName: string
    lastName: string
    phone: string
    password: string
  }): Promise<void> {
    const phone = normalizeLocalPhone(payload.phone)
    if (!isValidLocalPhone(phone)) throw new MockApiError(400, 'invalid_phone')
    if (MockDb.findUserByPhone(phone)) throw new MockApiError(409, 'phone_taken')
    pendingRegistrations.set(phone, { ...payload, phone })
    console.info(`[Mock SMS] Код для ${phone}: ${MOCK_OTP_CODE}`)
  },

  async verifyRegistration(payload: { phone: string; code: string }): Promise<AuthResponse> {
    const phone = normalizeLocalPhone(payload.phone)
    const pending = pendingRegistrations.get(phone)
    if (!pending || payload.code !== MOCK_OTP_CODE) throw new MockApiError(400, 'invalid_code')
    const user: User = {
      id: `user-${Date.now()}`,
      firstName: pending.firstName.trim(),
      lastName: pending.lastName.trim(),
      phone,
      role: 'customer',
      provider: 'email',
      discountPercent: null,
      discountLabel: null,
      createdAt: new Date().toISOString(),
    }

    MockDb.addUser({ password: pending.password, user })
    pendingRegistrations.delete(phone)
    const token = MockDb.createSession(user.id)
    setAuthToken(token)
    return { token, user }
  },

  async forgotPassword(payload: { phone: string }): Promise<void> {
    const phone = normalizeLocalPhone(payload.phone)
    if (MockDb.findUserByPhone(phone)) {
      passwordResetCodes.add(phone)
      console.info(`[Mock SMS] Код для ${phone}: ${MOCK_OTP_CODE}`)
    }
  },

  async resetPassword(payload: { phone: string; code: string; password: string }): Promise<void> {
    const phone = normalizeLocalPhone(payload.phone)
    const record = MockDb.findUserByPhone(phone)
    if (!record || !passwordResetCodes.has(phone) || payload.code !== MOCK_OTP_CODE) {
      throw new MockApiError(400, 'invalid_code')
    }
    MockDb.updateUserPassword(record.user.id, payload.password)
    passwordResetCodes.delete(phone)
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
