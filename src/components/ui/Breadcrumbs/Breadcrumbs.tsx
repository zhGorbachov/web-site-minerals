import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import styles from './Breadcrumbs.module.scss'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  variant?: 'default' | 'compact'
  className?: string
}

export function Breadcrumbs({ items, variant = 'default', className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Навігаційний ланцюжок"
      className={[styles.breadcrumbs, styles[variant], className ?? ''].filter(Boolean).join(' ')}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className={styles.item}>
              {item.href ? (
                <>
                  <Link
                    to={item.href}
                    className={isLast ? styles.linkActive : styles.link}
                  >
                    {item.label}
                  </Link>
                  {!isLast && <ChevronRight className={styles.separator} aria-hidden="true" />}
                </>
              ) : (
                <>
                  <span className={styles.current} aria-current="page">
                    {item.label}
                  </span>
                  {!isLast && <ChevronRight className={styles.separator} aria-hidden="true" />}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
