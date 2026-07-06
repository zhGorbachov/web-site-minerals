import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Category, SubCategory } from '@/types'
import { CategoryService } from '@/services/CategoryService'
import { SubCategoryService } from '@/services/SubCategoryService'
import { CatalogMenu } from '@/components/CatalogMenu'
import { useUIStore } from '@/store'
import { useScrollLock } from '@/hooks/useScrollLock'
import styles from './CatalogDrawer.module.scss'

export function CatalogDrawer() {
  const { isCatalogOpen, closeCatalog } = useUIStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, SubCategory[]>>({})
  const [loading, setLoading] = useState(false)
  const [canHover, setCanHover] = useState(false)

  useScrollLock(isCatalogOpen)

  useEffect(() => {
    if (!isCatalogOpen) {
      setCanHover(false)
      return
    }

    const timer = window.setTimeout(() => setCanHover(true), 200)
    return () => window.clearTimeout(timer)
  }, [isCatalogOpen])

  useEffect(() => {
    if (!isCatalogOpen) return

    setLoading(true)
    void Promise.all([CategoryService.getAll(), SubCategoryService.getAll()]).then(([cats, subs]) => {
      const grouped = subs.reduce<Record<string, SubCategory[]>>((acc, sub) => {
        if (!acc[sub.categorySlug]) acc[sub.categorySlug] = []
        acc[sub.categorySlug].push(sub)
        return acc
      }, {})

      setCategories(cats)
      setSubcategoriesByCategory(grouped)
      setLoading(false)
    })
  }, [isCatalogOpen])

  useEffect(() => {
    if (!isCatalogOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCatalog()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCatalogOpen, closeCatalog])

  return (
    <AnimatePresence>
      {isCatalogOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={styles.backdrop}
            onClick={closeCatalog}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260, mass: 0.85 }}
            className={styles.drawer}
            aria-label="Каталог товарів"
          >
            <CatalogMenu
              categories={categories}
              subcategoriesByCategory={subcategoriesByCategory}
              loading={loading}
              canHover={canHover}
              onNavigate={closeCatalog}
              onClose={closeCatalog}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
