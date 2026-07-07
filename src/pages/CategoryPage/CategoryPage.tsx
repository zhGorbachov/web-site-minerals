import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import type { Category, SubCategory, Product } from '@/types'
import { CategoryService } from '@/services/CategoryService'
import { SubCategoryService } from '@/services/SubCategoryService'
import { ProductService } from '@/services/ProductService'
import { SubcategoryNav } from '@/components/SubcategoryNav'
import { SubcategoryCard } from '@/components/SubcategoryCard'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductSort } from '@/components/ProductSort'
import { Breadcrumbs, EmptyState } from '@/components/ui'
import { sortProducts, type ProductSortOption } from '@/utils'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './CategoryPage.module.scss'

export function CategoryPage() {
  const { t, language } = useTranslation()
  const { category: categorySlug, subcategory: subcategorySlug } = useParams<{
    category: string
    subcategory?: string
  }>()

  const [category, setCategory] = useState<Category | undefined>()
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<ProductSortOption>('default')

  const isSubcategoryView = Boolean(subcategorySlug)

  useEffect(() => {
    if (!categorySlug) return

    setLoading(true)
    setSortBy('default')
    void Promise.all([
      CategoryService.getBySlug(categorySlug),
      SubCategoryService.getByCategory(categorySlug),
      isSubcategoryView
        ? ProductService.getBySubcategory(subcategorySlug!)
        : Promise.resolve([]),
    ]).then(([cat, subs, prods]) => {
      setCategory(cat)
      setSubcategories(subs)
      setProducts(prods)
      setLoading(false)
    })
  }, [categorySlug, subcategorySlug, isSubcategoryView, language])

  const activeSubcategory = subcategories.find((s) => s.slug === subcategorySlug)
  const sortedProducts = useMemo(
    () => sortProducts(products, sortBy, language),
    [products, sortBy, language],
  )

  const breadcrumbs = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.catalog'), href: '/catalog' },
    { label: category?.name ?? '...', href: `/catalog/${categorySlug}` },
    ...(activeSubcategory ? [{ label: activeSubcategory.name }] : []),
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={styles.header}
        >
          <h1 className={styles.title}>
            {activeSubcategory?.name ?? category?.name ?? '...'}
          </h1>
          {isSubcategoryView && !loading && (
            <div className={styles.headerActions}>
              <p className={styles.count}>{t('category.productCount', { count: products.length })}</p>
              <ProductSort value={sortBy} onChange={setSortBy} />
            </div>
          )}
        </motion.div>

        {!isSubcategoryView ? (
          <>
            <div className={styles.subcategoryGrid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.subcategorySkeleton} />
                  ))
                : subcategories.map((sub) => (
                    <SubcategoryCard
                      key={sub.id}
                      subcategory={sub}
                      categorySlug={categorySlug ?? ''}
                    />
                  ))}
            </div>

            {!loading && category && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={styles.bottomSection}
                aria-label={t('category.aboutSection')}
              >
                <h2 className={styles.bottomTitle}>{t('category.aboutSection')}</h2>
                <div className={styles.featuredPhoto}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className={styles.featuredImage}
                  />
                </div>
                {category.description && (
                  <p className={styles.bottomDescription}>{category.description}</p>
                )}
              </motion.section>
            )}
          </>
        ) : (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <SubcategoryNav
                subcategories={subcategories}
                activeSlug={subcategorySlug}
                categorySlug={categorySlug ?? ''}
              />
            </aside>

            <div className={styles.content}>
              {!loading && products.length === 0 ? (
                <EmptyState
                  icon={<PackageSearch />}
                  title={t('category.emptyTitle')}
                  description={t('category.emptyDescription')}
                />
              ) : (
                <ProductGrid products={sortedProducts} loading={loading} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
