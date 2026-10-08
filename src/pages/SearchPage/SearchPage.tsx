import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, PackageSearch, Search } from 'lucide-react'
import type { Product } from '@/types'
import { ProductService } from '@/services/ProductService'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductSort } from '@/components/ProductSort'
import { Breadcrumbs, EmptyState } from '@/components/ui'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useCanHover } from '@/hooks/useMediaQuery'
import { useTranslation } from '@/i18n/useTranslation'
import { sortProducts, type ProductSortOption } from '@/utils'
import styles from './SearchPage.module.scss'

const PAGE_SIZE = 20
const VISIBLE_PAGE_NUMBERS = 5

function getVisiblePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= VISIBLE_PAGE_NUMBERS) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  let start = currentPage - Math.floor(VISIBLE_PAGE_NUMBERS / 2)
  if (start < 0) start = 0
  if (start + VISIBLE_PAGE_NUMBERS > totalPages) {
    start = totalPages - VISIBLE_PAGE_NUMBERS
  }

  return Array.from({ length: VISIBLE_PAGE_NUMBERS }, (_, i) => start + i)
}

export function SearchPage() {
  const { t, tp, language } = useTranslation()
  const canHover = useCanHover()
  const openCatalog = useOpenCatalog()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(Boolean(query))
  const [sortBy, setSortBy] = useState<ProductSortOption>('default')
  const [productsPage, setProductsPage] = useState(0)

  useEffect(() => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setSortBy('default')
    setProductsPage(0)

    void ProductService.search(query)
      .then((items) => {
        if (cancelled) return
        setProducts(items)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setProducts([])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, language])

  const sortedProducts = useMemo(
    () => sortProducts(products, sortBy, language),
    [products, sortBy, language],
  )
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE))
  const visiblePageNumbers = getVisiblePageNumbers(productsPage, totalPages)
  const visibleProducts = useMemo(
    () => sortedProducts.slice(productsPage * PAGE_SIZE, (productsPage + 1) * PAGE_SIZE),
    [sortedProducts, productsPage],
  )

  useEffect(() => {
    setProductsPage(0)
  }, [sortBy])

  useEffect(() => {
    if (productsPage > totalPages - 1) {
      setProductsPage(Math.max(0, totalPages - 1))
    }
  }, [productsPage, totalPages])

  const breadcrumbs = [
    { label: t('nav.home'), href: '/' },
    { label: query ? t('searchPage.titleQuery', { query }) : t('searchPage.title') },
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
            {query ? t('searchPage.titleQuery', { query }) : t('searchPage.title')}
          </h1>
          {query && !loading && products.length > 0 && (
            <div className={styles.headerActions}>
              <p className={styles.count}>{tp(products.length)}</p>
              <ProductSort value={sortBy} onChange={setSortBy} />
            </div>
          )}
        </motion.div>

        {!query ? (
          <EmptyState
            icon={<Search />}
            title={t('searchPage.promptTitle')}
            description={t('searchPage.promptDescription')}
            action={{ label: t('nav.catalog'), onClick: openCatalog, variant: 'catalog' }}
          />
        ) : !loading && products.length === 0 ? (
          <EmptyState
            icon={<PackageSearch />}
            title={t('searchPage.emptyTitle')}
            description={t('searchPage.emptyDescription', { query })}
            action={{ label: t('nav.catalog'), onClick: openCatalog, variant: 'catalog' }}
          />
        ) : (
          <>
            <ProductGrid products={visibleProducts} loading={loading} skeletonCount={PAGE_SIZE} />
            {!loading && totalPages > 1 && (
              <nav className={styles.pagination} aria-label={t('searchPage.paginationAria')}>
                <motion.button
                  type="button"
                  className={styles.paginationBtn}
                  onClick={() => setProductsPage((page) => page - 1)}
                  disabled={productsPage === 0}
                  aria-label={t('common.paginationPrev')}
                  whileTap={canHover ? { scale: 0.9 } : undefined}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                >
                  <ChevronLeft size={15} />
                </motion.button>
                <div className={styles.paginationNumbers}>
                  {visiblePageNumbers.map((pageIndex) => {
                    const isActive = pageIndex === productsPage
                    return (
                      <motion.button
                        key={pageIndex}
                        type="button"
                        className={[
                          styles.paginationNumber,
                          isActive ? styles.paginationNumberActive : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setProductsPage(pageIndex)}
                        aria-label={t('common.paginationPage', { page: pageIndex + 1 })}
                        aria-current={isActive ? 'page' : undefined}
                        whileTap={canHover ? { scale: 0.92 } : undefined}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="searchProductsPaginationPill"
                            className={styles.paginationPill}
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          />
                        )}
                        <span className={styles.paginationNumberLabel}>{pageIndex + 1}</span>
                      </motion.button>
                    )
                  })}
                </div>
                <motion.button
                  type="button"
                  className={styles.paginationBtn}
                  onClick={() => setProductsPage((page) => page + 1)}
                  disabled={productsPage >= totalPages - 1}
                  aria-label={t('common.paginationNext')}
                  whileTap={canHover ? { scale: 0.9 } : undefined}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                >
                  <ChevronRight size={15} />
                </motion.button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
