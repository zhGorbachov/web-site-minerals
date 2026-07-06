import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  Truck,
  Gem,
  Star,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Category, Product } from '@/types'
import { CategoryService } from '@/services/CategoryService'
import { ProductService } from '@/services/ProductService'
import { mockImages } from '@/assets/mock/Images'
import { CategoryCard } from '@/components/CategoryCard'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui'
import { Button } from '@/components/ui'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { SITE_NAME } from '@/config/Site'
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
  const openCatalog = useOpenCatalog()
  const isMobile = useIsMobile()
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [newProductsPage, setNewProductsPage] = useState(0)
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([
      CategoryService.getAll(),
      ProductService.getNew(),
      ProductService.getPopular(),
    ]).then(([cats, newP, popP]) => {
      setCategories(cats)
      setNewProducts(newP)
      setPopularProducts(popP.slice(0, DESKTOP_NEW_LIMIT))
      setLoading(false)
    })
  }, [])

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

  return (
    <div className={styles.page}>
      {/* Hero banner — between header and catalog */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <img
            src={mockImages.homeHero}
            alt=""
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className={styles.heroDescription}>
            Справжній простір для поціновувачів природної краси та унікальних мінералів
          </p>
        </motion.div>
      </section>

      {/* Mobile home — catalog shortcuts */}
      <section className={styles.mobileHome}>
        <button type="button" className={styles.mobileCatalogBar} onClick={openCatalog}>
          <LayoutGrid size={20} aria-hidden />
          Каталог товарів
        </button>

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
            <h2 className={styles.sectionTitle}>Каталог товорів</h2>
            <p className={styles.sectionSubtitle}>Категорії для вашого натхнення</p>
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
            <h2 className={styles.sectionTitle}>Новинки</h2>
            <Link to="/catalog" className={styles.sectionLink} onClick={openCatalog}>
              Всі товари <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {loading
              ? Array.from({ length: isMobile ? MOBILE_NEW_PAGE_SIZE : 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : visibleNewProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {isMobile && !loading && newTotalPages > 1 && (
            <nav className={styles.mobilePagination} aria-label="Сторінки новинок">
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={() => setNewProductsPage((p) => Math.max(0, p - 1))}
                disabled={newProductsPage === 0}
                aria-label="Попередня сторінка"
              >
                <ChevronLeft size={15} />
              </button>
              <div className={styles.paginationNumbers}>
                {visiblePageNumbers.map((pageIndex) => (
                  <button
                    key={pageIndex}
                    type="button"
                    className={[
                      styles.paginationNumber,
                      pageIndex === newProductsPage ? styles.paginationNumberActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setNewProductsPage(pageIndex)}
                    aria-label={`Сторінка ${pageIndex + 1}`}
                    aria-current={pageIndex === newProductsPage ? 'page' : undefined}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={() => setNewProductsPage((p) => Math.min(newTotalPages - 1, p + 1))}
                disabled={newProductsPage >= newTotalPages - 1}
                aria-label="Наступна сторінка"
              >
                <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* Popular — desktop only */}
      <section className={[styles.section, styles.desktopSection].join(' ')}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Популярні товари</h2>
            <Link to="/catalog" className={styles.sectionLink} onClick={openCatalog}>
              Всі товари <ArrowRight size={16} />
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
            <h2 className={styles.sectionTitle}>Наші переваги</h2>
          </div>
          <div className={styles.advantagesGrid}>
            {ADVANTAGES.map((adv) => (
              <motion.div
                key={adv.title}
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
                alt="Наш магазин"
              />
            </motion.div>
            <motion.div
              className={styles.aboutContent}
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.heroEyebrow}>Про магазин</span>
              <h2 className={styles.sectionTitle}>Ми любимо мінерали так само, як і ви</h2>
              <p className={styles.aboutText}>
                {SITE_NAME} — це невеликий сімейний магазин натуральних мінералів, ниток та браслетів ручної роботи.
                Ми ретельно відбираємо кожен камінь та матеріал, щоб ви отримали тільки справжнє та якісне.
              </p>
              <p className={styles.aboutText}>
                Кожен браслет — унікальний. Кожен мінерал — справжній. Кожна нитка — перевірена.
              </p>
              <Button as={Link} to="/about" variant="outline" size="md">
                Дізнатись більше
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

const ADVANTAGES = [
  {
    icon: <Gem size={28} />,
    title: 'Натуральні матеріали',
    text: 'Тільки справжні мінерали та натуральні нитки без синтетики',
  },
  {
    icon: <Star size={28} />,
    title: 'Ручна робота',
    text: 'Кожен браслет виготовляється вручну з увагою до деталей',
  },
  {
    icon: <Truck size={28} />,
    title: 'Швидка доставка',
    text: 'Відправляємо Новою Поштою та Укрпоштою по всій Україні',
  },
  {
    icon: <Shield size={28} />,
    title: 'Гарантія якості',
    text: 'Обмін або повернення протягом 14 днів без зайвих питань',
  },
]
