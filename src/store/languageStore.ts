import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/i18n/Translations'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'uk',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'web-store-language' },
  ),
)
