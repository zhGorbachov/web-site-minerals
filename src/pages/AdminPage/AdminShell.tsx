import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { Button, Breadcrumbs } from '@/components/ui'
import type { BreadcrumbItem } from '@/components/ui'
import { ADMIN_TABS, ADMIN_TAB_LABELS, type AdminTab } from './adminShared'
import styles from './AdminPage.module.scss'

type AdminShellProps = {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  extraCrumbs?: BreadcrumbItem[]
  title?: string
  subtitle?: string | null
  message?: string | null
  error?: string | null
  children: ReactNode
}

export function AdminShell({
  activeTab,
  onTabChange,
  extraCrumbs,
  title,
  subtitle,
  message,
  error,
  children,
}: AdminShellProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    if (hydrated && !user) {
      navigate('/login', { replace: true })
    }
  }, [hydrated, user, navigate])

  if (!hydrated && !user) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.muted}>{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.error}>{t('admin.forbidden')}</p>
          <Button as={Link} to="/">
            {t('auth.backHome')}
          </Button>
        </div>
      </div>
    )
  }

  const crumbs: BreadcrumbItem[] = [
    { label: t('about.breadcrumbHome'), href: '/' },
    { label: t('profile.title'), href: '/profile' },
    {
      label: t('admin.title'),
      href: extraCrumbs?.length ? '/admin' : undefined,
    },
    ...(extraCrumbs ?? []),
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={crumbs} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={styles.title}>{title ?? t('admin.title')}</h1>
          {subtitle !== null && (
            <p className={styles.subtitle}>{subtitle ?? t('admin.subtitle')}</p>
          )}

          <div className={styles.tabs} role="tablist">
            {ADMIN_TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={[styles.tab, activeTab === id ? styles.tabActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onTabChange(id)}
              >
                {t(ADMIN_TAB_LABELS[id])}
              </button>
            ))}
          </div>

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {children}
        </motion.div>
      </div>
    </div>
  )
}
