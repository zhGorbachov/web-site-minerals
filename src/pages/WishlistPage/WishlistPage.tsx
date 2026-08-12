import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, Home } from 'lucide-react'
import type { Product } from '@/types'
import { ProductService } from '@/services/ProductService'
import { useCartStore, useWishlistStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation } from '@/i18n/useTranslation'
import { localizeProduct } from '@/i18n/localizeCatalog'
import { formatPrice, productRequiresOptions } from '@/utils'
import { EmptyState } from '@/components/ui'
import styles from './WishlistPage.module.scss'

export function WishlistPage() {
  const { t, tp, language } = useTranslation()
  const navigate = useNavigate()
  const productIds = useWishlistStore((s) => s.productIds)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)
  const removeManyFromWishlist = useWishlistStore((s) => s.removeManyFromWishlist)
  const addItem = useCartStore((s) => s.addItem)
  const openCatalog = useOpenCatalog()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  useEffect(() => {
    const validIds = new Set(productIds)
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [productIds])

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(products.map((product) => product.id)))
  }

  const toggleItem = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const handleRemoveSelected = async () => {
    if (!someSelected) return
    await removeManyFromWishlist([...selectedIds])
    setSelectedIds(new Set())
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return
    if (productRequiresOptions(product)) {
      navigate(`/product/${product.slug}`)
      return
    }
    void addItem(product)
  }

  if (count === 0 && !loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <EmptyState
            icon={<Heart />}
            title={t('wishlist.emptyTitle')}
            description={t('wishlist.emptyDescription')}
            action={{ label: t('common.toCatalog'), onClick: openCatalog, variant: 'catalog' }}
            secondaryAction={{
              label: t('notFound.goHome'),
              to: '/',
              icon: <Home />,
            }}
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
        </div>

        {!loading && products.length > 0 && (
          <div className={styles.selectionBar}>
            <label className={styles.selectAll}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected
                }}
                onChange={toggleSelectAll}
              />
              <span>{allSelected ? t('common.deselectAll') : t('common.selectAll')}</span>
            </label>

            <button
              type="button"
              className={[styles.bulkRemoveBtn, someSelected ? '' : styles.bulkRemoveBtnHidden]
                .filter(Boolean)
                .join(' ')}
              onClick={handleRemoveSelected}
              disabled={!someSelected}
              aria-hidden={!someSelected}
              tabIndex={someSelected ? 0 : -1}
              aria-label={t('common.removeSelectedAria')}
            >
              <Trash2 size={16} />
              <span>
                {t('common.removeSelected')}
                <span className={styles.bulkCount}>{someSelected ? selectedIds.size : 0}</span>
              </span>
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.itemsList}>
            {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
              <div key={i} className={styles.skeletonItem} />
            ))}
          </div>
        ) : (
          <div className={styles.itemsList}>
            <AnimatePresence initial={false}>
              {products.map((rawProduct) => {
                const product = localizeProduct(rawProduct, language)
                const displayPrice = product.discountPrice ?? product.price
                const isSelected = selectedIds.has(product.id)

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className={[styles.listItem, isSelected ? styles.listItemSelected : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <label className={styles.itemCheck}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={() => toggleItem(product.id)}
                        aria-label={product.name}
                      />
                    </label>

                    <Link to={`/product/${product.slug}`} className={styles.itemImage}>
                      <img src={product.images[0]} alt={product.name} />
                      {product.isNew && (
                        <span className={styles.badgeNew}>{t('product.badgeNew')}</span>
                      )}
                    </Link>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <Link to={`/product/${product.slug}`} className={styles.itemName}>
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFromWishlist(product.id)}
                          aria-label={t('wishlist.remove')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {product.subCategoryName && (
                        <span className={styles.itemCategory}>{product.subCategoryName}</span>
                      )}

                      <div className={styles.itemFooter}>
                        <div className={styles.priceGroup}>
                          <span
                            className={[
                              styles.itemPrice,
                              product.discountPrice ? styles.priceDiscounted : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {formatPrice(displayPrice, language)}
                          </span>
                          {product.discountPrice && (
                            <span className={styles.oldPrice}>
                              {formatPrice(product.price, language)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={styles.cartBtn}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          aria-label={t('cart.addToCartAria')}
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <Link to="/catalog" className={styles.continueShopping} onClick={openCatalog}>
          {t('cart.continueShopping')}
        </Link>
      </div>
    </div>
  )
}
