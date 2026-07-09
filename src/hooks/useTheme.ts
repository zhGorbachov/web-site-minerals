import { useCallback, useSyncExternalStore } from 'react'
import {
  applyTheme,
  DEFAULT_THEME,
  getStoredTheme,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type ThemeId,
} from '@/config/Themes'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('themechange', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('themechange', onStoreChange)
  }
}

function getThemeSnapshot(): ThemeId {
  return document.documentElement.dataset.theme as ThemeId || getStoredTheme()
}

function getServerThemeSnapshot(): ThemeId {
  return DEFAULT_THEME
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot)

  const setTheme = useCallback((nextTheme: ThemeId) => {
    applyTheme(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    window.dispatchEvent(new Event('themechange'))
  }, [])

  return { theme, setTheme, options: THEME_OPTIONS }
}
