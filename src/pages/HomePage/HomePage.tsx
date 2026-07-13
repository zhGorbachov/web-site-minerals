import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  Truck,
  Gem,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Category, Product } from '@/types'
import { CategoryService } from '@/services/CategoryService'
import { ProductService } from '@/services/ProductService'
import { mockImages } from '@/assets/mock/Images'
import { CategoryCard } from '@/components/CategoryCard'
import { CatalogButton } from '@/components/CatalogButton'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui'
import { Button } from '@/components/ui'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { SITE_NAME } from '@/config/Site'
import { HOME_PAGE_CATEGORY_SLUGS } from '@/config/Catalog'
import { SiteLogo } from '@/components/SiteLogo'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './HomePage.module.scss'

const MOBILE_NEW_ROWS = 5
const MOBILE_NEW_COLS = 2
const MOBILE_NEW_PAGE_SIZE = MOBILE_NEW_ROWS * MOBILE_NEW_COLS
const DESKTOP_NEW_LIMIT = 8
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

export function HomePage() {
  const { t, language } = useTranslation()
  const openCatalog = useOpenCatalog()
  const isMobile = useIsMobile()
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [newProductsPage, setNewProductsPage] = useState(0)
  const [pageDirection, setPageDirection] = useState(0)
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const advantages = [
    {
      key: 'natural',
      icon: <Gem size={28} />,
      title: t('home.advantageNaturalTitle'),
      text: t('home.advantageNaturalText'),
    },
    {
      key: 'handmade',
      icon: <Star size={28} />,
      title: t('home.advantageHandmadeTitle'),
      text: t('home.advantageHandmadeText'),
    },
    {
      key: 'delivery',
      icon: <Truck size={28} />,
      title: t('home.advantageDeliveryTitle'),
      text: t('home.advantageDeliveryText'),
    },
    {
      key: 'quality',
      icon: <Shield size={28} />,
      title: t('home.advantageQualityTitle'),
      text: t('home.advantageQualityText'),
    },
  ]

  useEffect(() => {
    void Promise.all([
      CategoryService.getAll(),
      ProductService.getNew(),
      ProductService.getPopular(),
    ]).then(([cats, newP, popP]) => {
      const homeCategories = cats.filter((cat) =>
        (HOME_PAGE_CATEGORY_SLUGS as readonly string[]).includes(cat.slug),
      )
      setCategories(homeCategories)
      setNewProducts(newP)
      setPopularProducts(popP.slice(0, DESKTOP_NEW_LIMIT))
      setLoading(false)
    })
  }, [language])

  const newTotalPages = Math.max(1, Math.ceil(newProducts.length / MOBILE_NEW_PAGE_SIZE))
  const visiblePageNumbers = getVisiblePageNumbers(newProductsPage, newTotalPages)
  const visibleNewProducts = isMobile
    ? newProducts.slice(
        newProductsPage * MOBILE_NEW_PAGE_SIZE,
        (newProductsPage + 1) * MOBILE_NEW_PAGE_SIZE,
      )
    : newProducts.slice(0, DESKTOP_NEW_LIMIT)

  useEffect(() => {
    if (newProductsPage > newTotalPages - 1) {
      setNewProductsPage(Math.max(0, newTotalPages - 1))
    }
  }, [newProductsPage, newTotalPages])

  const goToNewProductsPage = (page: number) => {
    setPageDirection(page === newProductsPage ? 0 : page > newProductsPage ? 1 : -1)
    setNewProductsPage(page)
  }

  return (
    <div className={styles.page}>
      {/* Hero banner — between header and catalog */}
      <section className={styles.hero}>
        <img
          src={mockImages.homeHero}
          alt=""
          className={styles.heroImage}
        />
        <div className={styles.heroPanel}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <SiteLogo className={styles.heroLogo} compact />
            <h1 className={styles.heroTitle}>
              {t('home.heroTitle', { siteName: SITE_NAME })}
            </h1>
            <p className={styles.heroDescription}>
              {t('home.heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile home — catalog shortcuts */}
      <section className={styles.mobileHome}>
        <CatalogButton className={styles.mobileCatalogBar} onClick={openCatalog} />

        <div className={styles.mobileCategoryRow}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.mobileCategorySkeleton} />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog/${cat.slug}`}
                  className={styles.mobileCategoryTile}
                >
                  <img src={cat.image} alt="" className={styles.mobileCategoryImage} />
                  <span className={styles.mobileCategoryLabel}>{cat.name}</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Categories — desktop only */}
      <section className={[styles.section, styles.desktopSection].join(' ')}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.catalogTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('home.catalogSubtitle')}</p>
          </div>
          <div className={styles.categoryGrid}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.categorySkeleton} />
                ))
              : categories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className={[styles.section, styles.mobileNewSection].join(' ')}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.newTitle')}</h2>
            <Link to="/catalog" className={styles.sectionLink} onClick={openCatalog}>
              {t('common.allProducts')} <ArrowRight size={16} />
            </Link>
          </div>
          <AnimatePresence mode="wait" custom={pageDirection}>
            <motion.div
              key={newProductsPage}
              className={styles.productGrid}
              custom={pageDirection}
              variants={{
                enter: (direction: number) => ({
                  opacity: 0,
                  x: direction >= 0 ? 28 : -28,
                }),
                center: {
                  opacity: 1,
                  x: 0,
                },
                exit: (direction: number) => ({
                  opacity: 0,
                  x: direction >= 0 ? -28 : 28,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {loading
                ? Array.from({ length: isMobile ? MOBILE_NEW_PAGE_SIZE : 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : visibleNewProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </motion.div>
          </AnimatePresence>
          {isMobile && !loading && newTotalPages > 1 && (
            <nav className={styles.mobilePagination} aria-label={t('home.newPaginationAria')}>
              <motion.button
                type="button"
                className={styles.paginationBtn}
                onClick={() => goToNewProductsPage(newProductsPage - 1)}
                disabled={newProductsPage === 0}
                aria-label={t('common.paginationPrev')}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              >
                <ChevronLeft size={15} />
              </motion.button>
              <div className={styles.paginationNumbers}>
                {visiblePageNumbers.map((pageIndex) => {
                  const isActive = pageIndex === newProductsPage
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
                      onClick={() => goToNewProductsPage(pageIndex)}
                      aria-label={t('common.paginationPage', { page: pageIndex + 1 })}
                      aria-current={isActive ? 'page' : undefined}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="homeNewProductsPaginationPill"
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
                onClick={() => goToNewProductsPage(newProductsPage + 1)}
                disabled={newProductsPage >= newTotalPages - 1}
                aria-label={t('common.paginationNext')}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              >
                <ChevronRight size={15} />
              </motion.button>
            </nav>
          )}
        </div>
      </section>

      {/* Popular — desktop only */}
      <section className={[styles.section, styles.desktopSection].join(' ')}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.popularTitle')}</h2>
            <Link to="/catalog" className={styles.sectionLink} onClick={openCatalog}>
              {t('common.allProducts')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.popularScroll}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.popularItem}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : popularProducts.map((p) => (
                  <div key={p.id} className={styles.popularItem}>
                    <ProductCard product={p} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Advantages — desktop only */}
      <section className={[styles.section, styles.sectionGray, styles.desktopSection].join(' ')}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.advantagesTitle')}</h2>
          </div>
          <div className={styles.advantagesGrid}>
            {advantages.map((adv) => (
              <motion.div
                key={adv.key}
                className={styles.advantageCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.advantageIcon}>{adv.icon}</div>
                <h3 className={styles.advantageTitle}>{adv.title}</h3>
                <p className={styles.advantageText}>{adv.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About — desktop only */}
      <section className={[styles.section, styles.desktopSection].join(' ')}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <motion.div
              className={styles.aboutImage}
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={mockImages.aboutStore}
                alt={t('about.storeAlt')}
              />
            </motion.div>
            <motion.div
              className={styles.aboutContent}
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.heroEyebrow}>{t('home.aboutEyebrow')}</span>
              <h2 className={styles.sectionTitle}>{t('about.heroTitle')}</h2>
              <p className={styles.aboutText}>
                {t('home.aboutDescription1', { siteName: SITE_NAME })}
              </p>
              <p className={styles.aboutText}>
                {t('home.aboutDescription2')}
              </p>
              <Button as={Link} to="/about" variant="outline" size="md">
                {t('home.aboutCta')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
