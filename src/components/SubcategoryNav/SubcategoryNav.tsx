import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { SubCategory } from '@/types'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './SubcategoryNav.module.scss'

interface SubcategoryNavProps {
  subcategories: SubCategory[]
  activeSlug?: string
  categorySlug: string
}

export function SubcategoryNav({ subcategories, activeSlug, categorySlug }: SubcategoryNavProps) {
  const { t } = useTranslation()

  if (subcategories.length === 0) return null

  return (
    <nav className={styles.desktopNav} aria-label={t('subcategoryNav.title')}>
      <h4 className={styles.desktopNavTitle}>{t('subcategoryNav.title')}</h4>
      <ul className={styles.desktopNavList}>
        <li>
          <Link
            to={`/catalog/${categorySlug}`}
            className={[styles.desktopNavLink, !activeSlug ? styles.desktopNavLinkActive : ''].filter(Boolean).join(' ')}
          >
            {t('common.allProducts')}
          </Link>
        </li>
        {subcategories.map((sub) => (
          <li key={sub.id}>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                to={`/catalog/${categorySlug}/${sub.slug}`}
                className={[styles.desktopNavLink, activeSlug === sub.slug ? styles.desktopNavLinkActive : ''].filter(Boolean).join(' ')}
              >
                {sub.name}
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </nav>
  )
}
