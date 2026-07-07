import type { ReactNode } from 'react'
import styles from './EmptyState.module.scss'
import { Button } from '../Button'
import { CatalogButton } from '@/components/CatalogButton'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'catalog'
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action &&
        (action.variant === 'catalog' ? (
          <CatalogButton label={action.label} variant="filled" onClick={action.onClick} />
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        ))}
    </div>
  )
}
