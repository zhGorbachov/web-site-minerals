export const THEME_STORAGE_KEY = 'site-theme'

export type ThemeId = 'sage' | 'purple' | 'agate' | 'brown'

export type ThemeOption = {
  id: ThemeId
  labelKey: 'footer.themeSage' | 'footer.themePurple' | 'footer.themeAgate' | 'footer.themeBrown'
  swatch: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'sage', labelKey: 'footer.themeSage', swatch: '#4A6B55' },
  { id: 'purple', labelKey: 'footer.themePurple', swatch: '#6B5B8A' },
  { id: 'agate', labelKey: 'footer.themeAgate', swatch: '#5A7A9A' },
  { id: 'brown', labelKey: 'footer.themeBrown', swatch: '#7A6352' },
]

export const DEFAULT_THEME: ThemeId = 'sage'

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === 'sage' || value === 'purple' || value === 'agate' || value === 'brown'
}

export function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme
}
