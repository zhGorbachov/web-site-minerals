import type { ReactElement } from 'react'
import { useLanguageStore } from '@/store/languageStore'
import type { Language } from '@/i18n/Translations'
import styles from './LanguageSwitcher.module.scss'

function FlagUa() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className={styles.flagSvg}>
      <rect width="24" height="8" fill="#005BBB" />
      <rect y="8" width="24" height="8" fill="#FFD500" />
    </svg>
  )
}

function FlagEn() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className={styles.flagSvg}>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  )
}

const FLAGS: Record<Language, { Flag: () => ReactElement }> = {
  uk: { Flag: FlagUa },
  en: { Flag: FlagEn },
}

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return (
    <div className={[styles.switcher, className].filter(Boolean).join(' ')} role="group" aria-label="Language">
      {(Object.keys(FLAGS) as Language[]).map((code) => {
        const { Flag } = FLAGS[code]
        const isActive = language === code

        return (
          <button
            key={code}
            type="button"
            className={[styles.flagBtn, isActive ? styles.flagBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => setLanguage(code)}
            aria-label={code === 'uk' ? 'Українська' : 'English'}
            aria-pressed={isActive}
          >
            <Flag />
          </button>
        )
      })}
    </div>
  )
}
