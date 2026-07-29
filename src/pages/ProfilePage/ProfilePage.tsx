import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import {
  LogOut,
  Mail,
  Phone,
  User,
  Percent,
  Package,
  Heart,
  ArrowRight,
  ChevronDown,
  Star,
  MessageSquareQuote,
  type LucideIcon,
} from 'lucide-react'
import type { Order, Product, StoreReview } from '@/types'
import { OrdersApi, ReviewsApi } from '@/api'
import { ProductService } from '@/services/ProductService'
import { useAuthStore, useCartStore, useWishlistStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils/formatPrice'
import { formatPhoneDisplay } from '@/utils/phone'
import { scrollToHashTarget } from '@/utils/hashNav'
import { Button, Breadcrumbs, Loader } from '@/components/ui'
import { ProductGrid } from '@/components/ProductGrid'
import styles from './ProfilePage.module.scss'

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const DETAIL_ICONS = {
  phone: { icon: Phone, tone: styles.toneTeal },
  email: { icon: Mail, tone: styles.toneIndigo },
  role: { icon: User, tone: styles.toneAmber },
} as const

const SECTION_ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  discounts: { icon: Percent, tone: styles.toneGreen },
  orders: { icon: Package, tone: styles.toneBlue },
  review: { icon: MessageSquareQuote, tone: styles.toneAmber },
  favourites: { icon: Heart, tone: styles.toneRose },
}

export function ProfilePage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const wishlistIds = useWishlistStore((s) => s.productIds)
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0))

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set())
  const [favourites, setFavourites] = useState<Product[]>([])
  const [favouritesLoading, setFavouritesLoading] = useState(true)
  const [myReview, setMyReview] = useState<StoreReview | null>(null)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false)

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
    setReviewLoading(true)
    void ReviewsApi.mine()
      .then(setMyReview)
      .catch(() => setMyReview(null))
      .finally(() => setReviewLoading(false))
  }, [user])

  useEffect(() => {
    if (!user || ordersLoading || reviewLoading) return
    if (location.hash !== '#review') return
    const timer = window.setTimeout(() => scrollToHashTarget('#review'), 120)
    return () => window.clearTimeout(timer)
  }, [user, ordersLoading, reviewLoading, location.hash])

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

  const toggleOrderItems = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const handleSubmitReview = async (event: FormEvent) => {
    event.preventDefault()
    setReviewError(null)
    setReviewSubmitting(true)
    try {
      const review = await ReviewsApi.create({
        rating: reviewRating,
        text: reviewText,
      })
      setMyReview(review)
      setReviewJustSubmitted(true)
      setReviewText('')
    } catch (error) {
      if (isAxiosError(error)) {
        const code = error.response?.data?.error
        if (code === 'already_reviewed') {
          setReviewError(t('profile.reviewAlready'))
        } else if (code === 'purchase_required') {
          setReviewError(t('profile.reviewNeedPurchase'))
        } else if (code === 'invalid_payload') {
          setReviewError(t('profile.reviewPlaceholder'))
        } else {
          setReviewError(t('profile.reviewError'))
        }
      } else {
        setReviewError(t('profile.reviewError'))
      }
    } finally {
      setReviewSubmitting(false)
    }
  }

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
                  <span className={[styles.detailIcon, DETAIL_ICONS.phone.tone].join(' ')}>
                    <DETAIL_ICONS.phone.icon size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>{t('auth.phone')}</span>
                    <span className={styles.detailValue}>{formatPhoneDisplay(user.phone)}</span>
                  </div>
                </li>
              )}
              {user.email && (
                <li className={styles.detail}>
                  <span className={[styles.detailIcon, DETAIL_ICONS.email.tone].join(' ')}>
                    <DETAIL_ICONS.email.icon size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>{t('auth.email')}</span>
                    <span className={styles.detailValue}>{user.email}</span>
                  </div>
                </li>
              )}
              {isAdmin && (
                <li className={styles.detail}>
                  <span className={[styles.detailIcon, DETAIL_ICONS.role.tone].join(' ')}>
                    <DETAIL_ICONS.role.icon size={18} />
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
              <div className={[styles.sectionIconWrap, SECTION_ICONS.discounts.tone].join(' ')}>
                <SECTION_ICONS.discounts.icon size={20} />
              </div>
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
              <div className={[styles.sectionIconWrap, SECTION_ICONS.orders.tone].join(' ')}>
                <SECTION_ICONS.orders.icon size={20} />
              </div>
              <h2 className={styles.sectionTitle}>{t('profile.ordersTitle')}</h2>
            </div>
            {ordersLoading ? (
              <Loader />
            ) : orders.length === 0 ? (
              <p className={styles.emptyText}>{t('profile.ordersEmpty')}</p>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((order) => {
                  const expanded = expandedOrderIds.has(order.id)
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

                  return (
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

                      {order.items.length > 0 && (
                        <>
                          <button
                            type="button"
                            className={styles.orderToggle}
                            onClick={() => toggleOrderItems(order.id)}
                            aria-expanded={expanded}
                          >
                            <span>
                              {expanded ? t('profile.hideOrderItems') : t('profile.showOrderItems')}
                              <span className={styles.orderToggleCount}>
                                {t('profile.orderItemsCount', { count: itemsCount })}
                              </span>
                            </span>
                            <ChevronDown
                              size={18}
                              className={[styles.orderToggleIcon, expanded ? styles.orderToggleIconOpen : '']
                                .filter(Boolean)
                                .join(' ')}
                              aria-hidden
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.ul
                                className={styles.orderProducts}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22 }}
                              >
                                {order.items.map((item) => (
                                  <li key={item.id} className={styles.orderProduct}>
                                    <div className={styles.orderProductImage}>
                                      {item.productImage ? (
                                        <img src={item.productImage} alt={item.productName} />
                                      ) : (
                                        <Package size={20} aria-hidden />
                                      )}
                                    </div>
                                    <div className={styles.orderProductBody}>
                                      <span className={styles.orderProductName}>{item.productName}</span>
                                      <span className={styles.orderProductMeta}>
                                        {t('profile.orderItemQty', { count: item.quantity })}
                                        {' · '}
                                        {formatPrice(item.price, language)} {t('cart.perUnit')}
                                      </span>
                                    </div>
                                    <span className={styles.orderProductTotal}>
                                      {formatPrice(item.price * item.quantity, language)}
                                    </span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className={styles.card} id="review">
            <div className={styles.sectionHead}>
              <div className={[styles.sectionIconWrap, SECTION_ICONS.review.tone].join(' ')}>
                <SECTION_ICONS.review.icon size={20} />
              </div>
              <h2 className={styles.sectionTitle}>{t('profile.reviewTitle')}</h2>
            </div>

            {reviewLoading || ordersLoading ? (
              <Loader />
            ) : myReview ? (
              <div className={styles.myReview}>
                {reviewJustSubmitted && <p className={styles.reviewSuccess}>{t('profile.reviewSuccess')}</p>}
                {!reviewJustSubmitted && <p className={styles.emptyText}>{t('profile.reviewAlready')}</p>}
                <div className={styles.reviewStars} aria-label={t('about.reviewRating', { rating: myReview.rating })}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < myReview.rating ? 'currentColor' : 'none'}
                      className={i < myReview.rating ? undefined : styles.reviewStarEmpty}
                    />
                  ))}
                </div>
                <p className={styles.myReviewText}>{myReview.text}</p>
                <time className={styles.myReviewDate} dateTime={myReview.createdAt}>
                  {new Date(myReview.createdAt).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US')}
                </time>
              </div>
            ) : orders.length === 0 ? (
              <p className={styles.emptyText}>{t('profile.reviewNeedPurchase')}</p>
            ) : (
              <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                <p className={styles.emptyText}>{t('profile.reviewHint')}</p>
                <fieldset className={styles.ratingField}>
                  <legend className={styles.ratingLabel}>{t('profile.reviewRatingLabel')}</legend>
                  <div className={styles.ratingStars}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1
                      const active = value <= reviewRating
                      return (
                        <button
                          key={value}
                          type="button"
                          className={[styles.ratingStarBtn, active ? styles.ratingStarBtnActive : '']
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => setReviewRating(value)}
                          aria-label={t('about.reviewRating', { rating: value })}
                        >
                          <Star size={22} fill={active ? 'currentColor' : 'none'} />
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <label className={styles.reviewTextLabel}>
                  <span className={styles.srOnly}>{t('profile.reviewTitle')}</span>
                  <textarea
                    className={styles.reviewTextarea}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t('profile.reviewPlaceholder')}
                    rows={4}
                    maxLength={1000}
                    required
                    minLength={10}
                  />
                </label>
                {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
                <Button type="submit" disabled={reviewSubmitting || reviewText.trim().length < 10}>
                  {t('profile.reviewSubmit')}
                </Button>
              </form>
            )}
          </section>

          <section className={styles.cardWide}>
            <div className={styles.sectionHead}>
              <div className={[styles.sectionIconWrap, SECTION_ICONS.favourites.tone].join(' ')}>
                <SECTION_ICONS.favourites.icon size={20} />
              </div>
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
