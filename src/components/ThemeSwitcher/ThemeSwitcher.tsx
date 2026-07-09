import type { CSSProperties } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { useTheme } from '@/hooks/useTheme'
import styles from './ThemeSwitcher.module.scss'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const { theme, setTheme, options } = useTheme()

  return (
    <div className={styles.switcher}>
      <p className={styles.label}>{t('footer.themeTest')}</p>
      <div className={styles.options} role="group" aria-label={t('footer.themeTest')}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.option} ${theme === option.id ? styles.optionActive : ''}`}
            style={{ '--swatch': option.swatch } as CSSProperties}
            aria-label={t(option.labelKey)}
            aria-pressed={theme === option.id}
            onClick={() => setTheme(option.id)}
          >
            <span className={styles.swatch} aria-hidden="true" />
            <span className={styles.optionLabel}>{t(option.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
