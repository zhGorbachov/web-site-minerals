import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import type { Product } from '@/types'
import { ProductService } from '@/services/ProductService'
import { useWishlistStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation } from '@/i18n/useTranslation'
import { ProductGrid } from '@/components/ProductGrid'
import { EmptyState } from '@/components/ui'
import styles from './WishlistPage.module.scss'

export function WishlistPage() {
  const { t, tp, language } = useTranslation()
  const productIds = useWishlistStore((s) => s.productIds)
  const clearWishlist = useWishlistStore((s) => s.clearWishlist)
  const openCatalog = useOpenCatalog()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const count = productIds.length

  useEffect(() => {
    if (count === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    void ProductService.getByIds(productIds).then((prods) => {
      setProducts(prods)
      setLoading(false)
    })
  }, [productIds, count, language])

  if (count === 0 && !loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <EmptyState
            icon={<Heart />}
            title={t('wishlist.emptyTitle')}
            description={t('wishlist.emptyDescription')}
            action={{ label: t('common.toCatalog'), onClick: openCatalog, variant: 'catalog' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {t('header.wishlist')}
            <span className={styles.titleCount}>{tp(count)}</span>
          </motion.h1>

          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearWishlist}
            aria-label={t('wishlist.clearAria')}
          >
            <Trash2 size={16} />
            <span>{t('wishlist.clearAll')}</span>
          </button>
        </div>

        <ProductGrid products={products} loading={loading} />

        <Link to="/catalog" className={styles.continueShopping} onClick={openCatalog}>
          {t('cart.continueShopping')}
        </Link>
      </div>
    </div>
  )
}
