import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, CheckCircle, PackageSearch, Minus, Plus } from 'lucide-react'
import type { Product } from '@/types'
import { ProductService } from '@/services/ProductService'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductSelections, ProductCharacteristics } from '@/components/ProductOptions'
import { ProductGrid } from '@/components/ProductGrid'
import { Breadcrumbs, Button, EmptyState } from '@/components/ui'
import { useCartStore, useWishlistStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils'
import styles from './ProductPage.module.scss'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useTranslation()
  const [product, setProduct] = useState<Product | undefined>()
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

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

  const maxSelectable = product ? Math.max(0, product.stock - cartQuantity) : 0

  useEffect(() => {
    if (!product || maxSelectable <= 0) return
    setQuantity((q) => Math.min(Math.max(1, q), maxSelectable))
  }, [product?.id, product?.stock, maxSelectable, selectedOptions])

  const handleAddToCart = () => {
    if (!product || addedToCart || maxSelectable <= 0) return
    addItem(product, selectedOptions, Math.min(quantity, maxSelectable))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

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

  const displayPrice = product.discountPrice ?? product.price
  const inWishlist = isInWishlist(product.id)
  const categoryLabel = product.subCategoryName ?? product.subCategorySlug

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
            <ProductGallery images={product.images} productName={product.name} />
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
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.metaRow}>
              {product.stock > 0 ? (
                <span className={styles.inStock}>{t('product.inStock')}</span>
              ) : (
                <span className={styles.outOfStock}>{t('product.outOfStock')}</span>
              )}

              <div className={styles.priceBlock}>
                {product.discountPrice && (
                  <span className={styles.oldPrice}>{formatPrice(product.price, language)}</span>
                )}
                <span
                  className={[
                    styles.price,
                    product.discountPrice ? styles.priceDiscounted : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {formatPrice(displayPrice, language)}
                </span>
              </div>
            </div>

            <div className={styles.optionsBlock}>
              <ProductSelections
                key={product.id}
                product={product}
                onOptionsChange={setSelectedOptions}
              />
            </div>

            <div className={styles.purchaseRow}>
              <div className={styles.qtyStepper}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={product.stock === 0}
                  aria-label={t('common.decreaseQty')}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                  disabled={product.stock === 0 || maxSelectable === 0 || quantity >= maxSelectable}
                  aria-label={t('common.increaseQty')}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                size="md"
                className={styles.addToCartBtn}
                disabled={product.stock === 0 || maxSelectable === 0 || addedToCart}
                leftIcon={addedToCart ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
              >
                {addedToCart ? t('cart.added') : maxSelectable === 0 ? t('cart.maxInCart') : t('cart.addToCart')}
              </Button>

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
              <ProductCharacteristics product={product} />
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
