import styles from './SiteLogo.module.scss'

interface SiteLogoProps {
  className?: string
  compact?: boolean
}

export function SiteLogo({ className, compact = false }: SiteLogoProps) {
  return (
    <span
      className={[
        styles.logo,
        compact ? styles.compact : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.line}>lux_.stones._</span>
      <span className={styles.ampersand}>&</span>
      <span className={styles.line}>lux_.jewelry._</span>
    </span>
  )
}
