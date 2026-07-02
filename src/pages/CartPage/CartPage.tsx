import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { formatPrice } from '@/utils'
import { Button, EmptyState } from '@/components/ui'
import styles from './CartPage.module.scss'

const OPTION_LABELS: Record<string, string> = {
  beadSize: 'Розмір',
  strandLength: 'Довжина',
  color: 'Колір',
  wristSize: 'Розмір',
}

export function CartPage() {
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
            title="Кошик порожній"
            description="Додайте товари з каталогу, щоб почати покупки"
            action={{ label: 'До каталогу', onClick: openCatalog }}
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
          Кошик
          <span className={styles.titleCount}>{count} {pluralize(count)}</span>
        </motion.h1>

        <div className={styles.layout}>
          <div className={styles.itemsList}>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const unitPrice = item.product.discountPrice ?? item.product.price
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
                    <Link to={`/product/${item.product.slug}`} className={styles.itemImage}>
                      <img src={item.product.images[0]} alt={item.product.name} />
                    </Link>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <Link to={`/product/${item.product.slug}`} className={styles.itemName}>
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.id)}
                          aria-label="Видалити товар"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {item.product.subCategoryName && (
                        <span className={styles.itemCategory}>{item.product.subCategoryName}</span>
                      )}

                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className={styles.itemOptions}>
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <span key={key} className={styles.optionChip}>
                              {OPTION_LABELS[key] ?? key}: {key === 'beadSize' ? `${value} мм` : value}
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
                            aria-label="Зменшити кількість"
                          >
                            <Minus size={16} />
                          </button>
                          <span className={styles.qty}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            aria-label="Збільшити кількість"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className={styles.priceCol}>
                          <span className={styles.itemPrice}>{formatPrice(unitPrice * item.quantity)}</span>
                          {item.quantity > 1 && (
                            <span className={styles.unitPrice}>{formatPrice(unitPrice)} / шт.</span>
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
            <h2 className={styles.summaryTitle}>Підсумок</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Товарів</span>
                <span>{count} шт.</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span className={styles.deliveryNote}>за тарифами перевізника</span>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Разом</span>
              <span className={styles.totalAmount}>{formatPrice(total)}</span>
            </div>

            <Button size="lg" fullWidth rightIcon={<ArrowRight size={18} />} disabled>
              Оформити замовлення
            </Button>
            <p className={styles.checkoutNote}>Оформлення замовлення — незабаром</p>

            <Link to="/catalog" className={styles.continueShopping} onClick={openCatalog}>
              Продовжити покупки
            </Link>
          </motion.aside>
        </div>
      </div>

      <div className={styles.mobileBar}>
        <div className={styles.mobileBarTotal}>
          <span className={styles.mobileBarLabel}>Разом</span>
          <span className={styles.mobileBarAmount}>{formatPrice(total)}</span>
        </div>
        <Button size="lg" rightIcon={<ArrowRight size={18} />} disabled className={styles.mobileBarBtn}>
          Оформити
        </Button>
      </div>
    </div>
  )
}

function pluralize(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'товар'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'товари'
  return 'товарів'
}
