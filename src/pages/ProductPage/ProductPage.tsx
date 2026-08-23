import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, Heart, CheckCircle, PackageSearch, Minus, Plus } from 'lucide-react'
import type { Product } from '@/types'
import { ProductService } from '@/services/ProductService'
import { ProductGallery } from '@/components/ProductGallery'
import {
  ProductSelections,
  ProductCharacteristics,
  ProductVariantPicker,
} from '@/components/ProductOptions'
import { ProductGrid } from '@/components/ProductGrid'
import { Breadcrumbs, Button, EmptyState } from '@/components/ui'
import { useCartStore, useWishlistStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils'
import {
  buildVariantSelection,
  findBestMatchingVariant,
  findVariantById,
  findVariantByImage,
  getAvailableStock,
  getCatalogPricing,
  getProductGalleryImages,
  getProductVariants,
  getSelectedVariant,
  getVariantCompareAtPrice,
  getVariantDisplayName,
  getVariantUnitPrice,
  hasProductVariants,
  optionsWithoutVariantId,
} from '@/utils/productVariants'
import styles from './ProductPage.module.scss'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useTranslation()
  const [product, setProduct] = useState<Product | undefined>()
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [addAnimKey, setAddAnimKey] = useState(0)
  const addedResetRef = useRef<number | null>(null)

  const addItem = useCartStore((s) => s.addItem)
  const cartQuantity = useCartStore((s) =>
    product ? s.getCartQuantity(product.id, selectedOptions) : 0,
  )
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const openCatalog = useOpenCatalog()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setAddedToCart(false)
    setQuantity(1)
    setSelectedOptions({})
    setGalleryIndex(0)
    void ProductService.getBySlug(slug).then(async (prod) => {
      if (prod) {
        const rel = await ProductService.getRelated(prod)
        setProduct(prod)
        setRelated(rel)
      } else {
        setProduct(undefined)
        setRelated([])
      }
      setLoading(false)
    })
  }, [slug, language])

  const maxSelectable = product ? Math.max(0, getAvailableStock(product, selectedOptions) - cartQuantity) : 0
  const availableStock = product ? getAvailableStock(product, selectedOptions) : 0
  const atMaxInCart = availableStock > 0 && maxSelectable === 0

  const galleryImages = product ? getProductGalleryImages(product) : []

  const syncGalleryToVariant = (nextProduct: Product, variantImage: string) => {
    const images = getProductGalleryImages(nextProduct)
    const index = images.indexOf(variantImage)
    if (index >= 0) setGalleryIndex(index)
  }

  const handleOptionsChange = (next: Record<string, string>) => {
    if (!product || !hasProductVariants(product)) {
      setSelectedOptions(next)
      return
    }
    const match = findBestMatchingVariant(product, next, selectedOptions.variantId)
    if (!match) {
      setSelectedOptions(next)
      return
    }
    setSelectedOptions(buildVariantSelection(match, next))
    syncGalleryToVariant(product, match.image)
  }

  const handleVariantPick = (variantId: string | null) => {
    if (!product) return
    if (!variantId) {
      setSelectedOptions(optionsWithoutVariantId(selectedOptions))
      setGalleryIndex(0)
      return
    }
    const variant = findVariantById(product, variantId)
    if (!variant) return
    setSelectedOptions(buildVariantSelection(variant, selectedOptions))
    syncGalleryToVariant(product, variant.image)
  }

  const handleGalleryIndex = (index: number) => {
    setGalleryIndex(index)
    if (!product) return
    const variant = findVariantByImage(product, galleryImages[index])
    if (variant) {
      setSelectedOptions(buildVariantSelection(variant, selectedOptions))
      return
    }
    setSelectedOptions(optionsWithoutVariantId(selectedOptions))
  }

  useEffect(() => {
    if (!product || maxSelectable <= 0) return
    setQuantity((q) => Math.min(Math.max(1, q), maxSelectable))
  }, [product?.id, product?.stock, maxSelectable, selectedOptions])

  const handleAddToCart = () => {
    if (!product || maxSelectable <= 0) return
    addItem(product, selectedOptions, Math.min(quantity, maxSelectable))
    setAddedToCart(true)
    setAddAnimKey((key) => key + 1)
    if (addedResetRef.current !== null) {
      window.clearTimeout(addedResetRef.current)
    }
    addedResetRef.current = window.setTimeout(() => setAddedToCart(false), 450)
  }

  useEffect(() => {
    return () => {
      if (addedResetRef.current !== null) {
        window.clearTimeout(addedResetRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.skeletonLayout}>
            <div className={styles.skeletonGallery} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine} style={{ width: '40%', height: 20 }} />
              <div className={styles.skeletonLine} style={{ width: '70%', height: 32 }} />
              <div className={styles.skeletonLine} style={{ width: '30%', height: 20 }} />
              <div className={styles.skeletonLine} style={{ height: 100 }} />
              <div className={styles.skeletonLine} style={{ height: 52 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container">
          <EmptyState
            icon={<PackageSearch />}
            title={t('product.notFoundTitle')}
            description={t('product.notFoundDescription')}
            action={{ label: t('common.toCatalog'), onClick: openCatalog, variant: 'catalog' }}
          />
        </div>
      </div>
    )
  }

  const selectedVariant = getSelectedVariant(product, selectedOptions)
  const catalogPricing = getCatalogPricing(product)
  const displayPrice = selectedVariant
    ? getVariantUnitPrice(product, selectedVariant)
    : catalogPricing.min
  const compareAt = selectedVariant
    ? getVariantCompareAtPrice(product, selectedVariant)
    : catalogPricing.compareAt
  const inWishlist = isInWishlist(product.id)
  const categoryLabel = product.subCategoryName ?? product.subCategorySlug
  const variants = getProductVariants(product)
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.stock > 0
  const displayName = getVariantDisplayName(product, selectedVariant)

  const breadcrumbs = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.catalog'), href: '/catalog' },
    { label: product.categoryName ?? product.categorySlug, href: `/catalog/${product.categorySlug}` },
    {
      label: categoryLabel,
      href: `/catalog/${product.categorySlug}/${product.subCategorySlug}`,
    },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={breadcrumbs} className={styles.breadcrumbs} />

        <motion.div
          className={styles.layout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.galleryCol}>
            <ProductGallery
              images={galleryImages}
              productName={displayName}
              activeIndex={galleryIndex}
              onActiveIndexChange={handleGalleryIndex}
              captions={galleryImages.map((src) => {
                const variant = findVariantByImage(product, src)
                if (!variant) return undefined
                return {
                  title: variant.name?.trim() || undefined,
                  outOfStock: variant.stock <= 0,
                }
              })}
            />
            {product.video && (
              <video
                className={styles.productVideo}
                src={product.video}
                controls
                playsInline
                preload="metadata"
              />
            )}
          </div>

          <div className={styles.infoCol}>
            <h1 className={styles.productTitle}>{displayName}</h1>

            <div className={styles.metaRow}>
              {inStock ? (
                <span className={styles.inStock}>{t('product.inStock')}</span>
              ) : (
                <span className={styles.outOfStock}>{t('product.outOfStock')}</span>
              )}

              <div className={styles.priceBlock}>
                {compareAt != null && (
                  <span className={styles.oldPrice}>{formatPrice(compareAt, language)}</span>
                )}
                <span
                  className={[
                    styles.price,
                    compareAt != null ? styles.priceDiscounted : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {!selectedVariant && catalogPricing?.hasRange
                    ? t('product.fromPrice', { price: formatPrice(displayPrice, language) })
                    : formatPrice(displayPrice, language)}
                </span>
              </div>
            </div>

            {variants.length > 0 && (
              <div className={styles.optionsBlock}>
                <ProductVariantPicker
                  product={product}
                  selectedId={selectedVariant?.id}
                  onSelect={handleVariantPick}
                />
              </div>
            )}

            <div className={styles.optionsBlock}>
              <ProductSelections
                product={product}
                selectedOptions={selectedOptions}
                onOptionsChange={handleOptionsChange}
              />
            </div>

            <div className={styles.purchaseRow}>
              <div className={styles.qtyStepper}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={availableStock === 0}
                  aria-label={t('common.decreaseQty')}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                  disabled={availableStock === 0 || maxSelectable === 0 || quantity >= maxSelectable}
                  aria-label={t('common.increaseQty')}
                >
                  <Plus size={16} />
                </button>
              </div>

              <span
                className={[
                  styles.addToCartBtnWrap,
                  addAnimKey > 0
                    ? addAnimKey % 2 === 0
                      ? styles.addToCartBtnPulseA
                      : styles.addToCartBtnPulseB
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Button
                  onClick={handleAddToCart}
                  size="md"
                  className={[
                    styles.addToCartBtn,
                    addedToCart ? styles.addToCartBtnAdded : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={availableStock === 0 || maxSelectable === 0}
                  leftIcon={
                    <span className={styles.addToCartIcon}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={addedToCart ? 'check' : 'cart'}
                          className={styles.addToCartIconInner}
                          initial={{ scale: 0.6, opacity: 0, y: 4 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.6, opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                        >
                          {addedToCart ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={addedToCart ? 'added' : atMaxInCart ? 'max' : 'add'}
                      className={styles.addToCartLabel}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                    >
                      {addedToCart
                        ? t('cart.added')
                        : atMaxInCart
                          ? t('cart.maxInCart')
                          : t('cart.addToCart')}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </span>

              <button
                type="button"
                className={[styles.wishlistBtn, inWishlist ? styles.wishlistActive : ''].filter(Boolean).join(' ')}
                onClick={() => toggleWishlist(product.id)}
                aria-label={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className={styles.characteristicsBlock}>
              <ProductCharacteristics product={product} variant={selectedVariant} />
            </div>

            <div className={styles.descriptionBlock}>
              <h2 className={styles.descTitle}>{t('product.description')}</h2>
              <p className={styles.description}>{product.description}</p>
            </div>
          </div>
        </motion.div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{t('product.related')}</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  )
}
