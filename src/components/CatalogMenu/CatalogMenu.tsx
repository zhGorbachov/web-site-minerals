import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Category, SubCategory } from '@/types'
import styles from './CatalogMenu.module.scss'

const MINERAL_SLUG = 'mineraly'
const PRIMARY_SLUGS = ['nytky', 'brаslety', MINERAL_SLUG] as const

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
  mineralSubcategories: SubCategory[]
  loading?: boolean
  canHover?: boolean
  onNavigate?: () => void
  onClose?: () => void
}

export function CatalogMenu({
  categories,
  mineralSubcategories,
  loading,
  canHover = true,
  onNavigate,
  onClose,
}: CatalogMenuProps) {
  const location = useLocation()
  const primaryCategories = PRIMARY_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is Category => Boolean(c))

  const isSubcategoryActive = (slug: string) =>
    location.pathname === `/catalog/${MINERAL_SLUG}/${slug}`

  return (
    <nav
      className={[styles.menu, canHover ? styles.canHover : ''].filter(Boolean).join(' ')}
      aria-label="Каталог товарів"
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Каталог товарів</h1>
        {onClose && (
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрити каталог">
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
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className={styles.categoryItem}>
                <div className={styles.skeleton} />
              </li>
            ))
          : primaryCategories.map((cat) => (
              <motion.li key={cat.id} className={styles.categoryItem} variants={itemVariants}>
                <Link to={`/catalog/${cat.slug}`} className={styles.primaryLink} onClick={onNavigate}>
                  <span>{cat.name}</span>
                  <ChevronRight size={18} className={styles.chevron} aria-hidden="true" />
                </Link>
                {cat.slug === MINERAL_SLUG && mineralSubcategories.length > 0 && (
                  <ul className={styles.subList}>
                    {mineralSubcategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={`/catalog/${MINERAL_SLUG}/${sub.slug}`}
                          className={[
                            styles.subLink,
                            isSubcategoryActive(sub.slug) ? styles.subLinkActive : '',
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
                )}
              </motion.li>
            ))}
      </motion.ul>
    </nav>
  )
}
