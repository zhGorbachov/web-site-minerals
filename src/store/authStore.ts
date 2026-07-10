import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { AuthApi, getAuthToken, setAuthToken } from '@/api'
import { isAxiosError } from 'axios'

export type AuthError =
  | 'email_taken'
  | 'invalid_credentials'
  | 'weak_password'
  | 'required'
  | 'invalid_email'
  | 'name_required'
  | 'oauth_not_configured'
  | 'oauth_denied'
  | 'oauth_failed'

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<AuthError | null>
  register: (payload: RegisterPayload) => Promise<AuthError | null>
  setSession: (token: string, user: User) => void
  logout: () => void
  bootstrap: () => Promise<void>
  isAuthenticated: () => boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapApiError(error: unknown): AuthError {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error
    if (code === 'email_taken') return 'email_taken'
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

      login: async (email, password) => {
        const normalized = email.trim().toLowerCase()
        if (!normalized || !password) return 'required'
        if (!EMAIL_RE.test(normalized)) return 'invalid_email'

        try {
          const data = await AuthApi.login({ email: normalized, password })
          set({ user: data.user, token: data.token })
          return null
        } catch (error) {
          return mapApiError(error) === 'oauth_failed' ? 'invalid_credentials' : mapApiError(error)
        }
      },

      register: async ({ firstName, lastName, email, phone, password }) => {
        const trimmedFirst = firstName.trim()
        const trimmedLast = lastName.trim()
        const normalized = email.trim().toLowerCase()

        if (!trimmedFirst || !trimmedLast) return 'name_required'
        if (!normalized || !password) return 'required'
        if (!EMAIL_RE.test(normalized)) return 'invalid_email'
        if (password.length < 6) return 'weak_password'

        try {
          const data = await AuthApi.register({
            firstName: trimmedFirst,
            lastName: trimmedLast,
            email: normalized,
            phone,
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
      version: 4,
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
