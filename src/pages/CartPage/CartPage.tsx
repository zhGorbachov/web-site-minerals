import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { attributeValueEn } from '@/i18n/CatalogEn'
import { localizeProduct } from '@/i18n/localizeCatalog'
import { formatPrice } from '@/utils'
import { Button, EmptyState } from '@/components/ui'
import styles from './CartPage.module.scss'

const OPTION_LABEL_KEYS: Record<string, TranslationKey> = {
  beadSize: 'productOptions.beadSize',
  strandLength: 'productOptions.strandLength',
  color: 'productOptions.color',
  wristSize: 'productOptions.wristSize',
}

export function CartPage() {
  const { t, tp, language } = useTranslation()
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
  const openCatalog = useOpenCatalog()
  const total = totalPrice()
  const count = totalItems()

  if (count === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <EmptyState
            icon={<ShoppingCart />}
            title={t('cart.emptyTitle')}
            description={t('cart.emptyDescription')}
            action={{ label: t('common.toCatalog'), onClick: openCatalog, variant: 'catalog' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {t('header.cart')}
          <span className={styles.titleCount}>{tp(count)}</span>
        </motion.h1>

        <div className={styles.layout}>
          <div className={styles.itemsList}>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const product = localizeProduct(item.product, language)
                const unitPrice = product.discountPrice ?? product.price

                const formatOptionValue = (key: string, value: string) => {
                  if (key === 'beadSize') return t('productOptions.beadSizeMm', { value })
                  if (language === 'en') {
                    return attributeValueEn[value] ?? value.replace(/\s*см/gi, ' cm')
                  }
                  return value
                }

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className={styles.cartItem}
                  >
                    <Link to={`/product/${product.slug}`} className={styles.itemImage}>
                      <img src={product.images[0]} alt={product.name} />
                    </Link>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <Link to={`/product/${product.slug}`} className={styles.itemName}>
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.id)}
                          aria-label={t('cart.removeItem')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {product.subCategoryName && (
                        <span className={styles.itemCategory}>{product.subCategoryName}</span>
                      )}

                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className={styles.itemOptions}>
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <span key={key} className={styles.optionChip}>
                              {OPTION_LABEL_KEYS[key] ? t(OPTION_LABEL_KEYS[key]) : key}: {formatOptionValue(key, value)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.itemFooter}>
                        <div className={styles.qtyStepper}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={t('common.decreaseQty')}
                          >
                            <Minus size={16} />
                          </button>
                          <span className={styles.qty}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            aria-label={t('common.increaseQty')}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className={styles.priceCol}>
                          <span className={styles.itemPrice}>{formatPrice(unitPrice * item.quantity, language)}</span>
                          {item.quantity > 1 && (
                            <span className={styles.unitPrice}>{formatPrice(unitPrice, language)} {t('cart.perUnit')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>

          <motion.aside
            className={styles.summary}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>{t('cart.itemsLabel')}</span>
                <span>{t('cart.itemsCount', { count })}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t('cart.delivery')}</span>
                <span className={styles.deliveryNote}>{t('cart.deliveryNote')}</span>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>{t('cart.total')}</span>
              <span className={styles.totalAmount}>{formatPrice(total, language)}</span>
            </div>

            <Button size="lg" fullWidth rightIcon={<ArrowRight size={18} />} disabled>
              {t('cart.checkout')}
            </Button>
            <p className={styles.checkoutNote}>{t('cart.checkoutSoon')}</p>

            <Link to="/catalog" className={styles.continueShopping} onClick={openCatalog}>
              {t('cart.continueShopping')}
            </Link>
          </motion.aside>
        </div>
      </div>

      <div className={styles.mobileBar}>
        <div className={styles.mobileBarTotal}>
          <span className={styles.mobileBarLabel}>{t('cart.total')}</span>
          <span className={styles.mobileBarAmount}>{formatPrice(total, language)}</span>
        </div>
        <Button size="lg" rightIcon={<ArrowRight size={18} />} disabled className={styles.mobileBarBtn}>
          {t('cart.checkoutShort')}
        </Button>
      </div>
    </div>
  )
}
