import { create } from 'zustand'

interface UIState {
  isBurgerOpen: boolean
  isCatalogOpen: boolean
  isSearchOpen: boolean
  openBurger: () => void
  closeBurger: () => void
  toggleBurger: () => void
  openCatalog: () => void
  closeCatalog: () => void
  toggleCatalog: () => void
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isBurgerOpen: false,
  isCatalogOpen: false,
  isSearchOpen: false,

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
}))
