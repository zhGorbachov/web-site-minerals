import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutContact,
  CheckoutLocation,
  SavedCheckoutProfile,
} from '@/types/checkout'

export const GUEST_CHECKOUT_PROFILE_KEY = 'guest'

interface CheckoutState {
  profiles: Record<string, SavedCheckoutProfile>
  getProfile: (userId: string) => SavedCheckoutProfile | null
  saveContact: (userId: string, contact: CheckoutContact) => void
  saveLocation: (userId: string, location: CheckoutLocation) => void
  clearProfile: (userId: string) => void
}

const emptyContact = (): CheckoutContact => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
})

const emptyLocation = (): CheckoutLocation => ({
  deliveryMethod: 'nova_poshta',
  city: '',
  branch: '',
  address: '',
})

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      profiles: {},

      getProfile: (userId) => get().profiles[userId] ?? null,

      saveContact: (userId, contact) => {
        set((state) => {
          const prev = state.profiles[userId]
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                contact,
                location: prev?.location ?? emptyLocation(),
              },
            },
          }
        })
      },

      saveLocation: (userId, location) => {
        set((state) => {
          const prev = state.profiles[userId]
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                contact: prev?.contact ?? emptyContact(),
                location,
              },
            },
          }
        })
      },

      clearProfile: (userId) => {
        set((state) => {
          const next = { ...state.profiles }
          delete next[userId]
          return { profiles: next }
        })
      },
    }),
    {
      name: 'crystal-checkout',
      version: 1,
      partialize: (state) => ({ profiles: state.profiles }),
    },
  ),
)
