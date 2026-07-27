import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutContact,
  CheckoutLocation,
  DeliveryMethod,
  NovaPoshtaType,
  SavedCheckoutProfile,
  UkrposhtaType,
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

export const emptyLocation = (): CheckoutLocation => ({
  deliveryMethod: 'nova_poshta',
  novaPoshtaType: 'warehouse',
  ukrposhtaType: 'basic',
  city: '',
  cityRef: undefined,
  branch: '',
  warehouseRef: undefined,
  address: '',
  postalIndex: '',
})

const DELIVERY_METHODS: DeliveryMethod[] = ['nova_poshta', 'ukrposhta', 'self_pickup']
const NOVA_POSHTA_TYPES: NovaPoshtaType[] = ['warehouse', 'parcel_locker', 'courier']
const UKRPOSHTA_TYPES: UkrposhtaType[] = ['basic', 'priority']

function normalizeLocation(raw: Partial<CheckoutLocation> & { deliveryMethod?: string }): CheckoutLocation {
  const base = emptyLocation()
  const legacyCourier = raw.deliveryMethod === 'courier'
  const deliveryMethod: DeliveryMethod =
    legacyCourier
      ? 'nova_poshta'
      : DELIVERY_METHODS.includes(raw.deliveryMethod as DeliveryMethod)
        ? (raw.deliveryMethod as DeliveryMethod)
        : base.deliveryMethod

  return {
    ...base,
    ...raw,
    deliveryMethod,
    novaPoshtaType: legacyCourier
      ? 'courier'
      : NOVA_POSHTA_TYPES.includes(raw.novaPoshtaType as NovaPoshtaType)
        ? (raw.novaPoshtaType as NovaPoshtaType)
        : base.novaPoshtaType,
    ukrposhtaType: UKRPOSHTA_TYPES.includes(raw.ukrposhtaType as UkrposhtaType)
      ? (raw.ukrposhtaType as UkrposhtaType)
      : base.ukrposhtaType,
    city: raw.city ?? '',
    branch: raw.branch ?? '',
    address: raw.address ?? '',
    postalIndex: raw.postalIndex ?? '',
  }
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      profiles: {},

      getProfile: (userId) => {
        const profile = get().profiles[userId]
        if (!profile) return null
        return {
          contact: profile.contact,
          location: normalizeLocation(profile.location),
        }
      },

      saveContact: (userId, contact) => {
        set((state) => {
          const prev = state.profiles[userId]
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                contact,
                location: prev?.location ? normalizeLocation(prev.location) : emptyLocation(),
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
                location: normalizeLocation(location),
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
      version: 2,
      partialize: (state) => ({ profiles: state.profiles }),
      migrate: (persisted) => {
        const state = persisted as { profiles?: Record<string, SavedCheckoutProfile> }
        const profiles = state.profiles ?? {}
        const next: Record<string, SavedCheckoutProfile> = {}
        for (const [key, profile] of Object.entries(profiles)) {
          next[key] = {
            contact: profile.contact,
            location: normalizeLocation(profile.location ?? emptyLocation()),
          }
        }
        return { profiles: next }
      },
    },
  ),
)
