import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Minus, Plus, CheckCircle } from 'lucide-react'
import type { Product } from '@/types'
import { useCartStore, useWishlistStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice, productRequiresOptions } from '@/utils'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const cartMenuRef = useRef<HTMLDivElement>(null)
  const [cartMenuOpen, setCartMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const cartQuantity = useCartStore((s) => s.getCartQuantity(product.id))
  const { toggleWishlist, isInWishlist } = useWishlistStore()

  const displayPrice = product.discountPrice ?? product.price
  const productUrl = `/product/${product.slug}`
  const inWishlist = isInWishlist(product.id)
  const needsOptions = productRequiresOptions(product)
  const maxSelectable = Math.max(0, product.stock - cartQuantity)

  useEffect(() => {
    if (!cartMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target as Node)) {
        setCartMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cartMenuOpen])

  useEffect(() => {
    if (maxSelectable <= 0) return
    setQuantity((q) => Math.min(Math.max(1, q), maxSelectable))
  }, [maxSelectable, product.id])

  const handleCartToggle = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (product.stock === 0) return
    setCartMenuOpen((open) => !open)
    setAddedToCart(false)
  }

  const handleAddToCart = () => {
    if (needsOptions) {
      navigate(productUrl)
      return
    }
    if (maxSelectable <= 0) return
    addItem(product, undefined, Math.min(quantity, maxSelectable))
    setAddedToCart(true)
    window.setTimeout(() => {
      setAddedToCart(false)
      setCartMenuOpen(false)
    }, 450)
  }

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={productUrl} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
          {product.isNew && (
            <span className={styles.badgeNew}>{t('product.badgeNew')}</span>
          )}
          {product.discountPrice && (
            <span className={styles.badgeSale}>
              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.contentRow}>
          <div className={styles.info}>
            <Link to={productUrl} className={styles.name}>
              {product.name}
            </Link>

            <div className={styles.priceGroup}>
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
              {product.discountPrice && (
                <span className={styles.oldPrice}>{formatPrice(product.price, language)}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={[styles.actionBtn, styles.wishlistBtn, inWishlist ? styles.wishlistActive : ''].filter(Boolean).join(' ')}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                toggleWishlist(product.id)
              }}
              aria-label={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>

            <div className={styles.cartWrap} ref={cartMenuRef}>
              <button
                type="button"
                className={[styles.actionBtn, styles.cartBtn, cartMenuOpen ? styles.cartBtnActive : ''].filter(Boolean).join(' ')}
                onClick={handleCartToggle}
                disabled={product.stock === 0}
                aria-label={t('cart.addToCartAria')}
                aria-expanded={cartMenuOpen}
              >
                <ShoppingCart size={16} />
              </button>

              <AnimatePresence>
                {cartMenuOpen && (
                  <motion.div
                    className={styles.cartMenu}
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {needsOptions ? (
                      <>
                        <p className={styles.cartMenuHint}>
                          {t('productCard.selectOptionsHint')}
                        </p>
                        <button
                          type="button"
                          className={styles.cartMenuSubmit}
                          onClick={() => navigate(productUrl)}
                        >
                          {t('productCard.goToProduct')}
                        </button>
                      </>
                    ) : maxSelectable === 0 ? (
                      <p className={styles.cartMenuHint}>{t('productCard.maxInCart')}</p>
                    ) : (
                      <>
                        <span className={styles.cartMenuLabel}>{t('common.quantity')}</span>
                        <div className={styles.qtyStepper}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            aria-label={t('common.decreaseQty')}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.qtyValue}>{quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                            disabled={quantity >= maxSelectable}
                            aria-label={t('common.increaseQty')}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className={[styles.cartMenuSubmit, addedToCart ? styles.cartMenuSubmitDone : ''].filter(Boolean).join(' ')}
                          onClick={handleAddToCart}
                        >
                          {addedToCart ? (
                            <>
                              <CheckCircle size={14} />
                              {t('cart.addedShort')}
                            </>
                          ) : (
                            t('cart.addToCart')
                          )}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
