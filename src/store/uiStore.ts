import { create } from 'zustand'

export type CartToast = {
  id: number
  kind: 'halfStrandsMerged'
  count: number
}

interface UIState {
  isBurgerOpen: boolean
  isCatalogOpen: boolean
  isSearchOpen: boolean
  toasts: CartToast[]
  openBurger: () => void
  closeBurger: () => void
  toggleBurger: () => void
  openCatalog: () => void
  closeCatalog: () => void
  toggleCatalog: () => void
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
  pushToast: (toast: Omit<CartToast, 'id'>) => void
  dismissToast: (id: number) => void
}

let toastSeq = 0

export const useUIStore = create<UIState>((set) => ({
  isBurgerOpen: false,
  isCatalogOpen: false,
  isSearchOpen: false,
  toasts: [],

  openBurger: () => set({ isBurgerOpen: true, isCatalogOpen: false, isSearchOpen: false }),
  closeBurger: () => set({ isBurgerOpen: false }),
  toggleBurger: () =>
    set((state) => {
      const willOpen = !state.isBurgerOpen
      return {
        isBurgerOpen: willOpen,
        isCatalogOpen: willOpen ? false : state.isCatalogOpen,
        isSearchOpen: willOpen ? false : state.isSearchOpen,
      }
    }),

  openCatalog: () => set({ isCatalogOpen: true, isBurgerOpen: false, isSearchOpen: false }),
  closeCatalog: () => set({ isCatalogOpen: false }),
  toggleCatalog: () =>
    set((state) => {
      const willOpen = !state.isCatalogOpen
      return {
        isCatalogOpen: willOpen,
        isBurgerOpen: willOpen ? false : state.isBurgerOpen,
        isSearchOpen: false,
      }
    }),

  openSearch: () => set({ isSearchOpen: true, isBurgerOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () =>
    set((state) => {
      const willOpen = !state.isSearchOpen
      return {
        isSearchOpen: willOpen,
        isBurgerOpen: willOpen ? false : state.isBurgerOpen,
      }
    }),

  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: ++toastSeq }],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
