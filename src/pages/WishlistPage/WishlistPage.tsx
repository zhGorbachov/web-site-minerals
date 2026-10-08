import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, Home } from 'lucide-react'
import type { Product, WishlistItem } from '@/types'
import { ProductService } from '@/services/ProductService'
import { useCartStore, useWishlistStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { attributeValueEn, strandLengthEn } from '@/i18n/CatalogEn'
import { localizeProduct } from '@/i18n/localizeCatalog'
import { formatPrice, getMissingRequiredOptionKeys, productRequiresOptions, wristSizeNumber } from '@/utils'
import {
  getAvailableStock,
  getCartUnitPrice,
  getSelectedVariant,
  getSelectionCompareAtPrice,
  getVariantCompareAtPrice,
  getVariantDisplayName,
  optionsWithoutVariantId,
} from '@/utils/productVariants'
import { isHalfStrandSelection } from '@/utils/strandPool'
import { EmptyState } from '@/components/ui'
import styles from './WishlistPage.module.scss'

const OPTION_LABEL_KEYS: Record<string, TranslationKey> = {
  beadSize: 'productOptions.beadSize',
  beadCount: 'productOptions.beadCount',
  strandLength: 'productOptions.strandLength',
  length: 'productOptions.threadLength',
  color: 'productOptions.color',
  wristSize: 'productOptions.wristSize',
  packWeight: 'productOptions.packWeight',
  pieceWeight: 'productOptions.pieceWeight',
}

export function WishlistPage() {
  const { t, tp, language } = useTranslation()
  const navigate = useNavigate()
  const wishlistItems = useWishlistStore((s) => s.items)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)
  const removeManyFromWishlist = useWishlistStore((s) => s.removeManyFromWishlist)
  const addItem = useCartStore((s) => s.addItem)
  const openCatalog = useOpenCatalog()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const count = wishlistItems.length
  const productKey = useMemo(
    () => [...new Set(wishlistItems.map((item) => item.productId))].join(','),
    [wishlistItems],
  )

  useEffect(() => {
    if (count === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    const ids = productKey ? productKey.split(',') : []
    setLoading(true)
    void ProductService.getByIds(ids).then((prods) => {
      setProducts(prods)
      setLoading(false)
    })
  }, [productKey, count, language])

  useEffect(() => {
    const validIds = new Set(wishlistItems.map((item) => item.id))
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [wishlistItems])

  const rows = wishlistItems.flatMap((entry) => {
    const raw = products.find((product) => product.id === entry.productId)
    if (!raw) return []
    return [{ entry, product: localizeProduct(raw, language) }]
  })

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.entry.id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(rows.map((row) => row.entry.id)))
  }

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const handleRemoveSelected = async () => {
    if (!someSelected) return
    await removeManyFromWishlist([...selectedIds])
    setSelectedIds(new Set())
  }

  const handleAddToCart = (product: Product, entry: WishlistItem) => {
    if (
      getMissingRequiredOptionKeys(product, entry.selectedOptions).length > 0 ||
      (!entry.selectedOptions && productRequiresOptions(product))
    ) {
      navigate(`/product/${product.slug}`)
      return
    }
    if (getAvailableStock(product, entry.selectedOptions) === 0) return
    void addItem(product, entry.selectedOptions)
  }

  const formatOptionValue = (key: string, value: string) => {
    if (key === 'beadSize') return t('productOptions.beadSizeMm', { value })
    if (key === 'wristSize') return wristSizeNumber(value)
    if (key === 'beadCount') return t('productOptions.beadCountValue', { value })
    if (language === 'en') {
      if (key === 'strandLength') {
        return strandLengthEn[value] ?? value.replace(/\s*см/gi, ' cm')
      }
      return attributeValueEn[value] ?? value.replace(/\s*см/gi, ' cm')
    }
    return value
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

        {!loading && rows.length > 0 && (
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
              {rows.map(({ entry, product }) => {
                const variant = getSelectedVariant(product, entry.selectedOptions)
                const displayPrice = getCartUnitPrice(product, entry.selectedOptions)
                const compareAt =
                  product.categorySlug === 'nytky' && isHalfStrandSelection(entry.selectedOptions)
                  ? getSelectionCompareAtPrice(product, entry.selectedOptions)
                  : variant
                    ? getVariantCompareAtPrice(product, variant)
                    : undefined
                const hasDiscount = compareAt != null && compareAt > displayPrice
                const isSelected = selectedIds.has(entry.id)
                const lineName = getVariantDisplayName(product, variant)
                const lineImage = variant?.image ?? product.images[0]
                const visibleOptions = optionsWithoutVariantId(entry.selectedOptions)
                const productUrl = variant
                  ? `/product/${product.slug}?variant=${variant.id}`
                  : `/product/${product.slug}`
                const outOfStock = getAvailableStock(product, entry.selectedOptions) === 0

                return (
                  <motion.article
                    key={entry.id}
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
                        onChange={() => toggleItem(entry.id)}
                        aria-label={lineName}
                      />
                    </label>

                    <Link to={productUrl} className={styles.itemImage}>
                      <img src={lineImage} alt={lineName} />
                      {product.isNew && (
                        <span className={styles.badgeNew}>{t('product.badgeNew')}</span>
                      )}
                    </Link>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <Link to={productUrl} className={styles.itemName}>
                          {lineName}
                        </Link>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFromWishlist(entry.id)}
                          aria-label={t('wishlist.remove')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {product.subCategoryName && (
                        <span className={styles.itemCategory}>{product.subCategoryName}</span>
                      )}

                      {Object.keys(visibleOptions).length > 0 && (
                        <div className={styles.itemOptions}>
                          {Object.entries(visibleOptions).map(([key, value]) => (
                            <span key={key} className={styles.optionChip}>
                              {OPTION_LABEL_KEYS[key] ? t(OPTION_LABEL_KEYS[key]) : key}:{' '}
                              {formatOptionValue(key, value)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.itemFooter}>
                        <div className={styles.priceGroup}>
                          <span
                            className={[
                              styles.itemPrice,
                              hasDiscount ? styles.priceDiscounted : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {formatPrice(displayPrice, language)}
                          </span>
                          {hasDiscount && compareAt != null && (
                            <span className={styles.oldPrice}>{formatPrice(compareAt, language)}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={styles.cartBtn}
                          onClick={() => handleAddToCart(product, entry)}
                          disabled={outOfStock}
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
