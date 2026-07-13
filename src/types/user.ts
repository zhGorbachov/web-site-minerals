export type UserRole = 'customer' | 'admin' | 'manager'

export type AuthProvider = 'email' | 'google' | 'apple'

export interface User {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  role: UserRole
  provider?: AuthProvider
  discountPercent?: number | null
  discountLabel?: string | null
  createdAt: string
}
