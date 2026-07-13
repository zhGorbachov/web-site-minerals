import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Mail, Phone, User, Percent, Package, Heart, ArrowRight } from 'lucide-react'
import type { Order, Product } from '@/types'
import { OrdersApi } from '@/api'
import { ProductService } from '@/services/ProductService'
import { useAuthStore, useCartStore, useWishlistStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils/formatPrice'
import { formatPhoneDisplay } from '@/utils/phone'
import { Button, Breadcrumbs, Loader } from '@/components/ui'
import { ProductGrid } from '@/components/ProductGrid'
import styles from './ProfilePage.module.scss'

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ProfilePage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const wishlistIds = useWishlistStore((s) => s.productIds)
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0))

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [favourites, setFavourites] = useState<Product[]>([])
  const [favouritesLoading, setFavouritesLoading] = useState(true)

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    setOrdersLoading(true)
    void OrdersApi.list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [user])

  useEffect(() => {
    if (!user) return
    if (!wishlistIds.length) {
      setFavourites([])
      setFavouritesLoading(false)
      return
    }
    setFavouritesLoading(true)
    void ProductService.getByIds(wishlistIds)
      .then(setFavourites)
      .finally(() => setFavouritesLoading(false))
  }, [user, wishlistIds, language])

  if (!user) return null

  const isAdmin = user.role === 'admin' || user.role === 'manager'

  const memberSince = new Date(user.createdAt).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const hasDiscount = Boolean(user.discountPercent && user.discountPercent > 0)

  const statusLabel = (status: Order['status']) => t(`profile.orderStatus.${status}`)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: t('profile.title') },
          ]}
        />

        <motion.div
          className={styles.layout}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <section className={styles.card}>
            <div className={styles.hero}>
              <div className={styles.avatar} aria-hidden="true">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className={styles.heroText}>
                <h1 className={styles.title}>
                  {user.firstName} {user.lastName}
                </h1>
                <p className={styles.memberSince}>
                  {t('profile.memberSince', { date: memberSince })}
                </p>
              </div>
            </div>

            <ul className={styles.details}>
              {user.phone && (
                <li className={styles.detail}>
                  <span className={styles.detailIcon}>
                    <Phone size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>{t('auth.phone')}</span>
                    <span className={styles.detailValue}>{formatPhoneDisplay(user.phone)}</span>
                  </div>
                </li>
              )}
              {user.email && (
                <li className={styles.detail}>
                  <span className={styles.detailIcon}>
                    <Mail size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>{t('auth.email')}</span>
                    <span className={styles.detailValue}>{user.email}</span>
                  </div>
                </li>
              )}
              {isAdmin && (
                <li className={styles.detail}>
                  <span className={styles.detailIcon}>
                    <User size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>{t('profile.role')}</span>
                    <span className={styles.detailValue}>{t('profile.roleAdmin')}</span>
                  </div>
                </li>
              )}
            </ul>

            <div className={styles.actions}>
              {cartCount > 0 && (
                <Button as={Link} to="/checkout" rightIcon={<ArrowRight size={18} />}>
                  {t('profile.checkoutCta')}
                </Button>
              )}
              {isAdmin && (
                <Button as={Link} to="/admin">
                  {t('profile.openAdmin')}
                </Button>
              )}
              <Button variant="ghost" leftIcon={<LogOut size={18} />} onClick={handleLogout}>
                {t('profile.logout')}
              </Button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHead}>
              <Percent size={20} />
              <h2 className={styles.sectionTitle}>{t('profile.discountsTitle')}</h2>
            </div>
            {hasDiscount ? (
              <div className={styles.discountBadge}>
                <strong>−{user.discountPercent}%</strong>
                <span>{user.discountLabel || t('profile.discountPersonal')}</span>
              </div>
            ) : (
              <p className={styles.emptyText}>{t('profile.discountsEmpty')}</p>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHead}>
              <Package size={20} />
              <h2 className={styles.sectionTitle}>{t('profile.ordersTitle')}</h2>
            </div>
            {ordersLoading ? (
              <Loader />
            ) : orders.length === 0 ? (
              <p className={styles.emptyText}>{t('profile.ordersEmpty')}</p>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((order) => (
                  <li key={order.id} className={styles.orderItem}>
                    <div className={styles.orderTop}>
                      <span className={styles.orderId}>
                        {t('profile.orderNumber', { id: order.id.slice(-8).toUpperCase() })}
                      </span>
                      <span className={styles.orderStatus}>{statusLabel(order.status)}</span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(
                          language === 'uk' ? 'uk-UA' : 'en-US',
                        )}
                      </span>
                      <span>{formatPrice(order.totalPrice, language)}</span>
                    </div>
                    <ul className={styles.orderProducts}>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.productName} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.cardWide}>
            <div className={styles.sectionHead}>
              <Heart size={20} />
              <h2 className={styles.sectionTitle}>{t('profile.favouritesTitle')}</h2>
              <Button as={Link} to="/wishlist" variant="outline" size="sm">
                {t('profile.openWishlist')}
              </Button>
            </div>
            {!favouritesLoading && favourites.length === 0 ? (
              <p className={styles.emptyText}>{t('profile.favouritesEmpty')}</p>
            ) : (
              <ProductGrid products={favourites} loading={favouritesLoading} />
            )}
          </section>
        </motion.div>
      </div>
    </div>
  )
}
