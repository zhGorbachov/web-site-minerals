export type UserRole = 'customer' | 'admin' | 'manager'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  createdAt: string
}
