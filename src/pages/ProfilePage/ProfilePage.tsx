import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Mail, Phone, User, KeyRound } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { Button, Breadcrumbs } from '@/components/ui'
import styles from './ProfilePage.module.scss'

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ProfilePage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const providerLabel =
    user.provider === 'google'
      ? t('profile.providerGoogle')
      : user.provider === 'apple'
        ? t('profile.providerApple')
        : t('profile.providerEmail')

  const roleLabel =
    user.role === 'admin' || user.role === 'manager'
      ? t('profile.roleAdmin')
      : t('profile.roleCustomer')

  const memberSince = new Date(user.createdAt).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: t('profile.title') },
          ]}
        />

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={styles.hero}>
            <div className={styles.avatar} aria-hidden="true">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.title}>
                {user.firstName} {user.lastName}
              </h1>
              <p className={styles.memberSince}>
                {t('profile.memberSince', { date: memberSince })}
              </p>
            </div>
          </div>

          <ul className={styles.details}>
            <li className={styles.detail}>
              <span className={styles.detailIcon}>
                <Mail size={18} />
              </span>
              <div>
                <span className={styles.detailLabel}>{t('auth.email')}</span>
                <span className={styles.detailValue}>{user.email}</span>
              </div>
            </li>
            {user.phone && (
              <li className={styles.detail}>
                <span className={styles.detailIcon}>
                  <Phone size={18} />
                </span>
                <div>
                  <span className={styles.detailLabel}>{t('auth.phone')}</span>
                  <span className={styles.detailValue}>{user.phone}</span>
                </div>
              </li>
            )}
            <li className={styles.detail}>
              <span className={styles.detailIcon}>
                <User size={18} />
              </span>
              <div>
                <span className={styles.detailLabel}>{t('profile.role')}</span>
                <span className={styles.detailValue}>{roleLabel}</span>
              </div>
            </li>
            <li className={styles.detail}>
              <span className={styles.detailIcon}>
                <KeyRound size={18} />
              </span>
              <div>
                <span className={styles.detailLabel}>{t('profile.signedInWith')}</span>
                <span className={styles.detailValue}>{providerLabel}</span>
              </div>
            </li>
          </ul>

          <div className={styles.actions}>
            {(user.role === 'admin' || user.role === 'manager') && (
              <Button as={Link} to="/admin">
                {t('profile.openAdmin')}
              </Button>
            )}
            <Button as={Link} to="/wishlist" variant="outline">
              {t('header.wishlist')}
            </Button>
            <Button variant="ghost" leftIcon={<LogOut size={18} />} onClick={handleLogout}>
              {t('profile.logout')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
