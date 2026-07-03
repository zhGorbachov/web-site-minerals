import { useLanguageStore } from '@/store/languageStore'
import { translations, type Language, type TranslationSchema } from './Translations'

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : T[K] extends Array<unknown>
          ? `${Prefix}${K}`
          : NestedKeyOf<T[K], `${Prefix}${K}.`>
    }[keyof T & string]
  : never

export type TranslationKey = NestedKeyOf<TranslationSchema>

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  const schema = translations[language]

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const value = getNestedValue(schema, key)
    if (typeof value !== 'string') return key

    if (!vars) return value

    return Object.entries(vars).reduce(
      (result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)),
      value,
    )
  }

  return { t, language, setLanguage }
}

export function getLanguageLabel(language: Language) {
  return language === 'uk' ? 'Українська' : 'English'
}
