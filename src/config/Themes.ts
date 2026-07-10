export const THEME_STORAGE_KEY = 'site-theme'

export type ThemeId = 'sage' | 'purple' | 'agate' | 'brown'

export type ThemeOption = {
  id: ThemeId
  labelKey: 'footer.themeSage' | 'footer.themePurple' | 'footer.themeAgate' | 'footer.themeBrown'
  swatch: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'sage', labelKey: 'footer.themeSage', swatch: '#73E3F5' },
  { id: 'purple', labelKey: 'footer.themePurple', swatch: '#8EE8F4' },
  { id: 'agate', labelKey: 'footer.themeAgate', swatch: '#20CFF3' },
  { id: 'brown', labelKey: 'footer.themeBrown', swatch: '#57DCF3' },
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
