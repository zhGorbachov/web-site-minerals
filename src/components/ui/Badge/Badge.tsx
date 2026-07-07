import type { ReactNode } from 'react'
import styles from './Badge.module.scss'
import { useTranslation } from '@/i18n/useTranslation'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  count?: number
}

export function Badge({ children, variant = 'neutral', count }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant]].join(' ')}>
      {count !== undefined ? count : children}
    </span>
  )
}

interface CartBadgeProps {
  count: number
}

export function CartBadge({ count }: CartBadgeProps) {
  const { t } = useTranslation()

  if (count === 0) return null
  return (
    <span className={styles.cartBadge} aria-label={t('badge.cartCount', { count })}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
