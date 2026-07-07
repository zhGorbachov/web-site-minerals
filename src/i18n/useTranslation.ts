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

  function tp(count: number): string {
    if (language === 'en') {
      return t(count === 1 ? 'common.productOne' : 'common.productMany', { count })
    }

    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return t('common.productOne', { count })
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return t('common.productFew', { count })
    }
    return t('common.productMany', { count })
  }

  return { t, tp, language, setLanguage }
}

export function getLanguageLabel(language: Language) {
  return language === 'uk' ? 'Українська' : 'English'
}
