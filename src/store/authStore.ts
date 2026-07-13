import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { AuthApi, getAuthToken, setAuthToken, isMockMode } from '@/api'
import { isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { isAxiosError } from 'axios'

export type AuthError =
  | 'email_taken'
  | 'phone_taken'
  | 'invalid_credentials'
  | 'weak_password'
  | 'required'
  | 'invalid_email'
  | 'invalid_phone'
  | 'name_required'
  | 'oauth_not_configured'
  | 'oauth_denied'
  | 'oauth_failed'

interface RegisterPayload {
  firstName: string
  lastName: string
  phone: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  hydrated: boolean
  login: (phone: string, password: string) => Promise<AuthError | null>
  loginWithGoogle: () => Promise<AuthError | null>
  register: (payload: RegisterPayload) => Promise<AuthError | null>
  setSession: (token: string, user: User) => void
  logout: () => void
  bootstrap: () => Promise<void>
  isAuthenticated: () => boolean
}

function mapApiError(error: unknown): AuthError {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error
    if (code === 'email_taken') return 'email_taken'
    if (code === 'phone_taken') return 'phone_taken'
    if (code === 'invalid_phone') return 'invalid_phone'
    if (code === 'invalid_credentials') return 'invalid_credentials'
    if (code === 'oauth_not_configured') return 'oauth_not_configured'
  }
  return 'oauth_failed'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getAuthToken(),
      hydrated: false,

      login: async (phone, password) => {
        const normalized = normalizeLocalPhone(phone)
        if (!normalized || !password) return 'required'
        if (!isValidLocalPhone(normalized)) return 'invalid_phone'

        try {
          const data = await AuthApi.login({ phone: normalized, password })
          set({ user: data.user, token: data.token })
          return null
        } catch (error) {
          return mapApiError(error) === 'oauth_failed' ? 'invalid_credentials' : mapApiError(error)
        }
      },

      loginWithGoogle: async () => {
        if (isMockMode) {
          try {
            const data = await AuthApi.loginWithGoogle()
            set({ user: data.user, token: data.token })
            return null
          } catch {
            return 'oauth_failed'
          }
        }

        window.location.assign(AuthApi.googleStartUrl())
        return null
      },

      register: async ({ firstName, lastName, phone, password }) => {
        const trimmedFirst = firstName.trim()
        const trimmedLast = lastName.trim()
        const normalizedPhone = normalizeLocalPhone(phone)

        if (!trimmedFirst || !trimmedLast) return 'name_required'
        if (!normalizedPhone || !password) return 'required'
        if (!isValidLocalPhone(normalizedPhone)) return 'invalid_phone'
        if (password.length < 6) return 'weak_password'

        try {
          const data = await AuthApi.register({
            firstName: trimmedFirst,
            lastName: trimmedLast,
            phone: normalizedPhone,
            password,
          })
          set({ user: data.user, token: data.token })
          return null
        } catch (error) {
          return mapApiError(error)
        }
      },

      setSession: (token, user) => {
        setAuthToken(token)
        set({ token, user })
      },

      logout: () => {
        AuthApi.logout()
        set({ user: null, token: null })
      },

      bootstrap: async () => {
        const token = getAuthToken()
        if (!token) {
          set({ user: null, token: null, hydrated: true })
          return
        }

        try {
          const user = await AuthApi.me()
          set({ user, token, hydrated: true })
        } catch {
          setAuthToken(null)
          set({ user: null, token: null, hydrated: true })
        }
      },

      isAuthenticated: () => get().user !== null,
    }),
    {
      name: 'crystal-auth',
      version: 6,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    },
  ),
)
