import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { SubCategory } from '@/types'
import { catalogCategoryPath, toggleSubcategorySelection } from '@/utils/catalogFilters'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './SubcategoryNav.module.scss'

interface SubcategoryNavProps {
  subcategories: SubCategory[]
  selectedSlugs: string[]
  categorySlug: string
}

export function SubcategoryNav({ subcategories, selectedSlugs, categorySlug }: SubcategoryNavProps) {
  const { t } = useTranslation()

  if (subcategories.length === 0) return null

  const order = subcategories.map((sub) => sub.slug)
  const noneSelected = selectedSlugs.length === 0

  return (
    <>
      <nav className={styles.mobileNav} aria-label={t('subcategoryNav.title')}>
        <Link
          to={catalogCategoryPath(categorySlug)}
          className={[styles.chip, noneSelected ? styles.chipActive : ''].filter(Boolean).join(' ')}
          aria-current={noneSelected ? 'page' : undefined}
        >
          {t('common.allProducts')}
        </Link>
        {subcategories.map((sub) => {
          const selected = selectedSlugs.includes(sub.slug)
          return (
            <Link
              key={sub.id}
              to={catalogCategoryPath(
                categorySlug,
                toggleSubcategorySelection(selectedSlugs, sub.slug),
                order,
              )}
              className={[styles.chip, selected ? styles.chipActive : ''].filter(Boolean).join(' ')}
              aria-pressed={selected}
            >
              {sub.name}
            </Link>
          )
        })}
      </nav>

      <nav className={styles.desktopNav} aria-label={t('subcategoryNav.title')}>
        <h4 className={styles.desktopNavTitle}>{t('subcategoryNav.title')}</h4>
        <p className={styles.desktopNavHint}>{t('subcategoryNav.hint')}</p>
        <ul className={styles.desktopNavList}>
          <li>
            <Link
              to={catalogCategoryPath(categorySlug)}
              className={[styles.desktopNavLink, noneSelected ? styles.desktopNavLinkActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={noneSelected ? 'page' : undefined}
            >
              {t('common.allProducts')}
            </Link>
          </li>
          {subcategories.map((sub) => {
            const selected = selectedSlugs.includes(sub.slug)
            return (
              <li key={sub.id}>
                <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
                  <Link
                    to={catalogCategoryPath(
                      categorySlug,
                      toggleSubcategorySelection(selectedSlugs, sub.slug),
                      order,
                    )}
                    className={[
                      styles.desktopNavLink,
                      styles.desktopNavCheck,
                      selected ? styles.desktopNavLinkActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selected}
                  >
                    <span className={styles.checkbox} data-checked={selected ? 'true' : 'false'} aria-hidden="true" />
                    {sub.name}
                  </Link>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
