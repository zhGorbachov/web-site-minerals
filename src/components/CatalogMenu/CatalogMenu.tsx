import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, LayoutGrid, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Category, SubCategory } from '@/types'
import { CATALOG_MENU_ORDER } from '@/config/Catalog'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './CatalogMenu.module.scss'

const MINERAL_SLUG = 'mineraly'

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 380, damping: 26 },
  },
}

interface CatalogMenuProps {
  categories: Category[]
  subcategoriesByCategory: Record<string, SubCategory[]>
  loading?: boolean
  canHover?: boolean
  onNavigate?: () => void
  onClose?: () => void
}

export function CatalogMenu({
  categories,
  subcategoriesByCategory,
  loading,
  canHover = true,
  onNavigate,
  onClose,
}: CatalogMenuProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(() => new Set([MINERAL_SLUG]))

  const primaryCategories = CATALOG_MENU_ORDER.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is Category => Boolean(c))

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] === 'catalog' && parts[1]) {
      setOpenSlugs((prev) => new Set([...prev, parts[1]]))
    }
  }, [location.pathname])

  const toggleCategory = (slug: string) => {
    setOpenSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const isSubcategoryActive = (categorySlug: string, subSlug: string) =>
    location.pathname === `/catalog/${categorySlug}/${subSlug}`

  return (
    <nav
      className={[styles.menu, canHover ? styles.canHover : ''].filter(Boolean).join(' ')}
      aria-label={t('catalog.title')}
    >
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <LayoutGrid size={20} className={styles.titleIcon} aria-hidden="true" />
          <h1 className={styles.title}>{t('catalog.title')}</h1>
        </div>
        {onClose && (
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('catalog.close')}>
            <X size={22} />
          </button>
        )}
      </div>

      <motion.ul
        className={styles.primaryList}
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className={styles.categoryItem}>
                <div className={styles.skeleton} />
              </li>
            ))
          : primaryCategories.map((cat) => {
              const subs = subcategoriesByCategory[cat.slug] ?? []
              const isOpen = openSlugs.has(cat.slug)
              const hasSubs = subs.length > 0

              return (
                <motion.li key={cat.id} className={styles.categoryItem} variants={itemVariants}>
                  <div className={styles.categoryHeader}>
                    <Link
                      to={`/catalog/${cat.slug}`}
                      className={styles.primaryLink}
                      onClick={onNavigate}
                    >
                      {cat.name}
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        className={[styles.expandBtn, isOpen ? styles.expandBtnOpen : ''].filter(Boolean).join(' ')}
                        onClick={() => toggleCategory(cat.slug)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? t('catalog.collapse', { name: cat.name }) : t('catalog.expand', { name: cat.name })}
                      >
                        <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {hasSubs && isOpen && (
                      <motion.div
                        key={`${cat.slug}-subs`}
                        className={styles.subCollapse}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ul className={styles.subList}>
                          {subs.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/catalog/${cat.slug}/${sub.slug}`}
                                className={[
                                  styles.subLink,
                                  isSubcategoryActive(cat.slug, sub.slug) ? styles.subLinkActive : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={onNavigate}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
      </motion.ul>
    </nav>
  )
}
