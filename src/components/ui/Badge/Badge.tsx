import type { ReactNode } from 'react'
import styles from './Badge.module.scss'

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
  if (count === 0) return null
  return (
    <span className={styles.cartBadge} aria-label={`${count} товарів у кошику`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
