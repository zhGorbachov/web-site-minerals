import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { AdminApi, CatalogApi } from '@/api'
import type { AdminOrder, AdminProductPayload, AdminUser } from '@/api'
import { useAuthStore } from '@/store'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { Button, Input, Select } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { MediaUploader } from '@/components/MediaUploader'
import { ProductAttributesEditor } from '@/components/ProductAttributesEditor'
import type { Category, OrderStatus, PaymentStatus, Product, SubCategory } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { buildProductSku, uniqueSku } from '@/utils/sku'
import { AdminShell } from './AdminShell'
import { isAdminTab, mapAdminError, type AdminTab } from './adminShared'
import styles from './AdminPage.module.scss'

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'assembling',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'awaiting_payment', 'paid', 'failed']

const PAYMENT_TONES: Record<PaymentStatus, SelectOption['tone']> = {
  unpaid: 'warning',
  awaiting_payment: 'info',
  paid: 'success',
  failed: 'danger',
}

const STATUS_TONES: Partial<Record<OrderStatus, SelectOption['tone']>> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  assembling: 'info',
  ready: 'success',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
}

const ORDERS_PAGE_SIZE = 8
const SUBCATEGORIES_PAGE_SIZE = 10
const VISIBLE_PAGE_NUMBERS = 5

function getVisiblePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= VISIBLE_PAGE_NUMBERS) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  let start = currentPage - Math.floor(VISIBLE_PAGE_NUMBERS / 2)
  if (start < 0) start = 0
  if (start + VISIBLE_PAGE_NUMBERS > totalPages) {
    start = totalPages - VISIBLE_PAGE_NUMBERS
  }

  return Array.from({ length: VISIBLE_PAGE_NUMBERS }, (_, i) => start + i)
}

function paymentMethodLabel(
  method: string,
  t: (key: TranslationKey) => string,
): string {
  switch (method) {
    case 'bank_transfer':
      return t('checkout.paymentBank')
    case 'pickup':
    case 'cod':
      return t('checkout.paymentPickup')
    default:
      return method
  }
}

function deliveryMethodLabel(
  method: string,
  t: (key: TranslationKey) => string,
): string {
  switch (method) {
    case 'nova_poshta':
      return t('checkout.novaPoshta')
    case 'ukrposhta':
      return t('checkout.ukrposhta')
    case 'self_pickup':
    case 'pickup':
      return t('checkout.selfPickup')
    default:
      return method
  }
}

const emptyForm: AdminProductPayload = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: 0,
  discountPrice: null,
  stock: 0,
  images: [],
  video: null,
  subCategoryId: '',
  featured: false,
  popular: false,
  isNew: true,
  attributes: {},
}

function deriveShortDescription(description: string): string {
  const text = description.trim().replace(/\s+/g, ' ')
  if (!text) return '—'
  return text.length <= 200 ? text : `${text.slice(0, 197).trimEnd()}…`
}

export function AdminPage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const tab: AdminTab = isAdminTab(searchParams.get('tab')) ? searchParams.get('tab')! : 'orders'

  const setTab = (next: AdminTab) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'orders') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [ordersPage, setOrdersPage] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set())
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [discountDrafts, setDiscountDrafts] = useState<
    Record<string, { percent: string; label: string }>
  >({})
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdminProductPayload>(emptyForm)
  const [skuManual, setSkuManual] = useState(false)
  const [saving, setSaving] = useState(false)

  const [subSearch, setSubSearch] = useState('')
  const [subsPage, setSubsPage] = useState(0)

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prods, cats, subs, adminUsers, adminOrders] = await Promise.all([
        AdminApi.getProducts(),
        CatalogApi.getCategories(),
        CatalogApi.getSubcategories(),
        AdminApi.getUsers(),
        AdminApi.getOrders(),
      ])
      setProducts(prods)
      setCategories(cats)
      setSubcategories(subs)
      setUsers(adminUsers)
      setOrders(adminOrders)
      setStockDrafts(Object.fromEntries(prods.map((p) => [p.id, p.stock])))
      setDiscountDrafts(
        Object.fromEntries(
          adminUsers.map((u) => [
            u.id,
            {
              percent: u.discountPercent != null ? String(u.discountPercent) : '',
              label: u.discountLabel ?? '',
            },
          ]),
        ),
      )
      if (!form.subCategoryId && subs[0]) {
        setForm((f) => ({ ...f, subCategoryId: subs[0].id }))
      }
    } catch (err) {
      setError(t(mapAdminError(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    const flashMsg = (location.state as { flash?: string } | null)?.flash
    if (!flashMsg) return
    setMessage(flashMsg)
    setError(null)
    window.setTimeout(() => setMessage(null), 2500)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [location.pathname, location.search, location.state, navigate])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [products, search])

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((order) => order.id.toLowerCase().includes(q))
  }, [orders, orderSearch])

  const ordersTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE))
  const ordersVisiblePages = getVisiblePageNumbers(ordersPage, ordersTotalPages)
  const pagedOrders = useMemo(
    () =>
      filteredOrders.slice(ordersPage * ORDERS_PAGE_SIZE, (ordersPage + 1) * ORDERS_PAGE_SIZE),
    [filteredOrders, ordersPage],
  )

  useEffect(() => {
    setOrdersPage(0)
  }, [orderSearch])

  useEffect(() => {
    if (ordersPage > ordersTotalPages - 1) {
      setOrdersPage(Math.max(0, ordersTotalPages - 1))
    }
  }, [ordersPage, ordersTotalPages])

  const goToOrdersPage = (page: number) => {
    setOrdersPage(Math.max(0, Math.min(page, ordersTotalPages - 1)))
  }

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const hay = [u.firstName, u.lastName, u.phone, u.email].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [users, userSearch])

  const filteredSubs = useMemo(() => {
    const q = subSearch.trim().toLowerCase()
    if (!q) return subcategories
    return subcategories.filter((sub) => {
      const categoryName =
        categories.find((cat) => cat.id === sub.categoryId)?.name ?? sub.categorySlug
      return (
        sub.name.toLowerCase().includes(q) ||
        sub.slug.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      )
    })
  }, [subcategories, categories, subSearch])

  const subsTotalPages = Math.max(1, Math.ceil(filteredSubs.length / SUBCATEGORIES_PAGE_SIZE))
  const subsVisiblePages = getVisiblePageNumbers(subsPage, subsTotalPages)
  const pagedSubs = useMemo(
    () =>
      filteredSubs.slice(
        subsPage * SUBCATEGORIES_PAGE_SIZE,
        (subsPage + 1) * SUBCATEGORIES_PAGE_SIZE,
      ),
    [filteredSubs, subsPage],
  )

  useEffect(() => {
    setSubsPage(0)
  }, [subSearch])

  useEffect(() => {
    if (subsPage > subsTotalPages - 1) {
      setSubsPage(Math.max(0, subsTotalPages - 1))
    }
  }, [subsPage, subsTotalPages])

  const goToSubsPage = (page: number) => {
    setSubsPage(Math.max(0, Math.min(page, subsTotalPages - 1)))
  }

  const selectedSubcategory = useMemo(
    () => subcategories.find((sub) => sub.id === form.subCategoryId),
    [subcategories, form.subCategoryId],
  )
  const formCategorySlug = selectedSubcategory?.categorySlug ?? ''
  const suggestedSku = useMemo(() => {
    if (!selectedSubcategory) return ''
    return uniqueSku(
      buildProductSku({
        categorySlug: selectedSubcategory.categorySlug,
        subCategorySlug: selectedSubcategory.slug,
        name: form.name,
      }),
      products.map((p) => p.sku),
    )
  }, [selectedSubcategory, form.name, products])
  const skuValue = editingId || skuManual ? (form.sku ?? '') : suggestedSku

  const handleSubcategoryChange = (subCategoryId: string) => {
    const nextSlug = subcategories.find((sub) => sub.id === subCategoryId)?.categorySlug
    const prevSlug = selectedSubcategory?.categorySlug
    setForm((f) => ({
      ...f,
      subCategoryId,
      attributes: nextSlug && prevSlug && nextSlug !== prevSlug ? {} : f.attributes,
    }))
  }

  const flash = (text: string) => {
    setMessage(text)
    setError(null)
    window.setTimeout(() => setMessage(null), 2500)
  }

  const toggleOrderItems = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const updateOrderField = async (
    orderId: string,
    payload: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ) => {
    setUpdatingOrderId(orderId)
    setError(null)
    try {
      const updated = await AdminApi.updateOrder(orderId, payload)
      setOrders((list) => list.map((order) => (order.id === orderId ? updated : order)))
      flash(t('admin.ordersSaved'))
    } catch (err) {
      setError(t(mapAdminError(err)))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const saveUserDiscount = async (userId: string, clear = false) => {
    const draft = discountDrafts[userId] ?? { percent: '', label: '' }
    const percent = clear ? null : draft.percent.trim() === '' ? null : Number(draft.percent)
    if (!clear && (percent == null || Number.isNaN(percent) || percent < 0 || percent > 100)) {
      setError(t('admin.errorGeneric'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await AdminApi.setUserDiscount(userId, {
        discountPercent: percent,
        discountLabel: clear ? null : draft.label.trim() || null,
      })
      setUsers((list) => list.map((u) => (u.id === userId ? updated : u)))
      setDiscountDrafts((d) => ({
        ...d,
        [userId]: {
          percent: updated.discountPercent != null ? String(updated.discountPercent) : '',
          label: updated.discountLabel ?? '',
        },
      }))
      flash(t('admin.usersSaved'))
    } catch (err) {
      setError(t(mapAdminError(err)))
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setSkuManual(true)
    setTab('create')
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice ?? null,
      stock: product.stock,
      images: product.images,
      video: product.video ?? null,
      subCategoryId: product.subCategoryId,
      featured: product.featured,
      popular: product.popular,
      isNew: product.isNew,
      attributes: (product.attributes as Record<string, unknown>) ?? {},
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setSkuManual(false)
    setForm({
      ...emptyForm,
      subCategoryId: subcategories[0]?.id ?? '',
    })
  }

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.images.length) {
      setError(t('admin.imagesRequired'))
      return
    }
    setSaving(true)
    setError(null)
    const payload: AdminProductPayload = {
      ...form,
      shortDescription: deriveShortDescription(form.description),
      discountPrice: form.discountPrice || null,
      video: form.video || null,
      slug: form.slug || undefined,
      sku: skuValue || undefined,
    }

    try {
      if (editingId) {
        await AdminApi.updateProduct(editingId, payload)
        flash(t('admin.successSaved'))
      } else {
        await AdminApi.createProduct(payload)
        flash(t('admin.successCreated'))
      }
      resetForm()
      setTab('products')
      await load()
    } catch (err) {
      setError(t(mapAdminError(err)))
    } finally {
      setSaving(false)
    }
  }

  const handleStockSave = async (id: string) => {
    const stock = stockDrafts[id]
    if (stock == null || stock < 0) return
    try {
      const updated = await AdminApi.updateStock(id, stock)
      setProducts((list) => list.map((p) => (p.id === id ? updated : p)))
      flash(t('admin.successSaved'))
    } catch (err) {
      setError(t(mapAdminError(err)))
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.removeConfirm'))) return
    try {
      await AdminApi.deleteProduct(id)
      flash(t('admin.successDeleted'))
      await load()
    } catch (err) {
      setError(t(mapAdminError(err)))
    }
  }

  const handleDeleteSub = async (id: string) => {
    if (!window.confirm(t('admin.removeSubConfirm'))) return
    try {
      await AdminApi.deleteSubcategory(id)
      flash(t('admin.successSubDeleted'))
      await load()
    } catch (err) {
      setError(t(mapAdminError(err)))
    }
  }

  const customerLabel = (order: AdminOrder) => {
    if (!order.customer) return t('admin.ordersGuest')
    const name = `${order.customer.firstName} ${order.customer.lastName}`.trim()
    const contact = [order.customer.phone, order.customer.email].filter(Boolean).join(' · ')
    return contact ? `${name} · ${contact}` : name
  }

  return (
    <AdminShell
      activeTab={tab}
      onTabChange={(id) => {
        if (id === 'create' && !editingId) resetForm()
        setTab(id)
      }}
      message={message}
      error={error}
    >
          {loading ? (
            <p className={styles.muted}>{t('admin.loading')}</p>
          ) : tab === 'orders' ? (
            <div className={styles.panel}>
              <Input
                label={t('admin.tabOrders')}
                placeholder={t('admin.ordersSearch')}
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              {filteredOrders.length === 0 ? (
                <p className={styles.muted}>{t('admin.ordersEmpty')}</p>
              ) : (
                <>
                <ul className={styles.orderList}>
                  {pagedOrders.map((order) => {
                    const expanded = expandedOrderIds.has(order.id)
                    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
                    const busy = updatingOrderId === order.id
                    return (
                      <li key={order.id} className={styles.orderCard}>
                        <div className={styles.orderTop}>
                          <div className={styles.orderMetaBlock}>
                            <h3 className={styles.orderId}>#{order.id}</h3>
                            <p className={styles.orderCustomer}>
                              {t('admin.ordersCustomer')}: {customerLabel(order)}
                            </p>
                            <p className={styles.orderDate}>
                              {new Date(order.createdAt).toLocaleString(
                                language === 'uk' ? 'uk-UA' : 'en-US',
                              )}
                            </p>
                          </div>
                          <div className={styles.orderTotal}>
                            <span className={styles.orderTotalLabel}>{t('admin.ordersTotal')}</span>
                            <span className={styles.orderTotalValue}>
                              {formatPrice(order.totalPrice, language)}
                            </span>
                          </div>
                        </div>

                        <div className={styles.orderControls}>
                          <Select
                            label={t('admin.ordersPayment')}
                            value={order.paymentStatus ?? 'unpaid'}
                            disabled={busy}
                            options={PAYMENT_STATUSES.map((status) => ({
                              value: status,
                              label: t(`admin.paymentStatus.${status}`),
                              tone: PAYMENT_TONES[status],
                            }))}
                            onChange={(next) =>
                              void updateOrderField(order.id, {
                                paymentStatus: next as PaymentStatus,
                              })
                            }
                          />
                          <Select
                            label={t('admin.ordersFulfillment')}
                            value={order.status}
                            disabled={busy}
                            options={ORDER_STATUSES.map((status) => ({
                              value: status,
                              label: t(`profile.orderStatus.${status}`),
                              tone: STATUS_TONES[status] ?? 'neutral',
                            }))}
                            onChange={(next) =>
                              void updateOrderField(order.id, {
                                status: next as OrderStatus,
                              })
                            }
                          />
                        </div>

                        <p className={styles.orderMethods}>
                          {t('admin.ordersDelivery')}:{' '}
                          {deliveryMethodLabel(order.deliveryMethod, t)}
                        </p>
                        <p className={styles.orderPayer}>
                          {t('admin.ordersPaymentMethod')}:{' '}
                          <span>{paymentMethodLabel(order.paymentMethod, t)}</span>
                          {(order.paymentMethod === 'pickup' ||
                            order.paymentMethod === 'cod') && (
                            <>
                              <br />
                              {t('admin.ordersCodHint')}
                            </>
                          )}
                          {(order.paymentMethod === 'bank_transfer' ||
                            order.payerFullName) && (
                            <>
                              <br />
                              {t('admin.ordersPayerFullName')}:{' '}
                              <span>{order.payerFullName?.trim() || '—'}</span>
                            </>
                          )}
                        </p>

                        {order.items.length > 0 && (
                          <>
                            <button
                              type="button"
                              className={styles.orderToggle}
                              onClick={() => toggleOrderItems(order.id)}
                              aria-expanded={expanded}
                            >
                              <span>
                                {expanded ? t('admin.ordersHideItems') : t('admin.ordersShowItems')}
                                <span className={styles.orderToggleCount}>({itemsCount})</span>
                              </span>
                              <ChevronDown
                                size={16}
                                className={[
                                  styles.orderToggleIcon,
                                  expanded ? styles.orderToggleIconOpen : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.ul
                                  className={styles.orderProducts}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {order.items.map((item) => (
                                    <li key={item.id} className={styles.orderProduct}>
                                      <div className={styles.orderProductImage}>
                                        {item.productImage ? (
                                          <img src={item.productImage} alt="" />
                                        ) : null}
                                      </div>
                                      <div className={styles.orderProductBody}>
                                        <span className={styles.orderProductName}>
                                          {item.productName}
                                        </span>
                                        <span className={styles.orderProductMeta}>
                                          {t('admin.ordersItemQty', { count: item.quantity })}
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
                {ordersTotalPages > 1 && (
                  <nav className={styles.pagination} aria-label={t('admin.ordersPaginationAria')}>
                    <motion.button
                      type="button"
                      className={styles.paginationBtn}
                      onClick={() => goToOrdersPage(ordersPage - 1)}
                      disabled={ordersPage === 0}
                      aria-label={t('common.paginationPrev')}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    >
                      <ChevronLeft size={15} />
                    </motion.button>
                    <div className={styles.paginationNumbers}>
                      {ordersVisiblePages.map((pageIndex) => {
                        const isActive = pageIndex === ordersPage
                        return (
                          <motion.button
                            key={pageIndex}
                            type="button"
                            className={[
                              styles.paginationNumber,
                              isActive ? styles.paginationNumberActive : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => goToOrdersPage(pageIndex)}
                            aria-label={t('common.paginationPage', { page: pageIndex + 1 })}
                            aria-current={isActive ? 'page' : undefined}
                            whileTap={{ scale: 0.92 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="adminOrdersPaginationPill"
                                className={styles.paginationPill}
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              />
                            )}
                            <span className={styles.paginationNumberLabel}>{pageIndex + 1}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                    <motion.button
                      type="button"
                      className={styles.paginationBtn}
                      onClick={() => goToOrdersPage(ordersPage + 1)}
                      disabled={ordersPage >= ordersTotalPages - 1}
                      aria-label={t('common.paginationNext')}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    >
                      <ChevronRight size={15} />
                    </motion.button>
                  </nav>
                )}
                </>
              )}
            </div>
          ) : tab === 'products' ? (
            <div className={styles.panel}>
              <Input
                label={t('admin.tabProducts')}
                placeholder={t('admin.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ul className={styles.productList}>
                {filtered.map((product) => (
                  <li key={product.id} className={styles.productCard}>
                    <div className={styles.productTop}>
                      <img src={product.images[0]} alt="" className={styles.thumb} />
                      <div className={styles.productMeta}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <p className={styles.productSku}>{product.sku}</p>
                        <p className={styles.productPrice}>
                          {product.price}
                          {product.discountPrice != null && (
                            <span className={styles.discount}> / {product.discountPrice}</span>
                          )}
                        </p>
                      </div>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconAction}
                          aria-label={t('admin.edit')}
                          onClick={() => startEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconActionDanger}
                          aria-label={t('admin.remove')}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.stockBlock}>
                      <label className={styles.stockLabel} htmlFor={`stock-${product.id}`}>
                        {t('admin.stock')}
                      </label>
                      <div className={styles.stockRow}>
                        <input
                          id={`stock-${product.id}`}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          className={styles.stockInput}
                          value={stockDrafts[product.id] ?? product.stock}
                          onChange={(e) =>
                            setStockDrafts((d) => ({
                              ...d,
                              [product.id]: Number(e.target.value),
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          fullWidth
                          className={styles.stockSaveBtn}
                          onClick={() => handleStockSave(product.id)}
                        >
                          {t('admin.saveStock')}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : tab === 'create' ? (
            <form className={styles.panel} onSubmit={handleSaveProduct}>
              <div className={styles.formGrid}>
                <Input
                  label={t('admin.name')}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <Input
                  label={t('admin.sku')}
                  value={skuValue}
                  onChange={(e) => {
                    setSkuManual(true)
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }}
                  hint={t('admin.skuHint')}
                  placeholder={suggestedSku || t('admin.skuPlaceholder')}
                />
                <Input
                  label={t('admin.slug')}
                  value={form.slug ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
                <Input
                  label={t('admin.price')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  required
                />
                <Input
                  label={t('admin.discountPrice')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPrice ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPrice: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label={t('admin.stock')}
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                  required
                />
              </div>

              <label className={styles.selectLabel}>
                {t('admin.subcategory')}
                <select
                  className={styles.select}
                  value={form.subCategoryId}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  required
                >
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.categorySlug} / {sub.name}
                    </option>
                  ))}
                </select>
              </label>

              <ProductAttributesEditor
                categorySlug={formCategorySlug}
                attributes={(form.attributes as Record<string, unknown>) ?? {}}
                onChange={(attributes) => setForm((f) => ({ ...f, attributes }))}
              />

              <label className={styles.selectLabel}>
                {t('admin.description')}
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </label>

              <div className={styles.mediaSection}>
                <span className={styles.mediaLabel}>{t('admin.media')}</span>
                <MediaUploader
                  images={form.images}
                  video={form.video}
                  onImagesChange={(images) => setForm((f) => ({ ...f, images }))}
                  onVideoChange={(video) => setForm((f) => ({ ...f, video }))}
                />
              </div>

              <div className={styles.checks}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  {t('admin.featured')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.popular)}
                    onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                  />
                  {t('admin.popular')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(form.isNew)}
                    onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                  />
                  {t('admin.isNew')}
                </label>
              </div>

              <div className={styles.formActions}>
                <Button type="submit" loading={saving} leftIcon={<Plus size={16} />}>
                  {editingId ? t('admin.updateProduct') : t('admin.createProduct')}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    {t('admin.cancelEdit')}
                  </Button>
                )}
              </div>
            </form>
          ) : tab === 'subcategories' ? (
            <div className={styles.panel}>
              <div className={styles.listToolbar}>
                <div className={styles.listToolbarSearch}>
                  <Input
                    label={t('admin.tabSubcategories')}
                    placeholder={t('admin.subSearchPlaceholder')}
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                  />
                </div>
                <Button
                  as={Link}
                  to="/admin/subcategories/new"
                  leftIcon={<Plus size={16} />}
                  className={styles.listToolbarAction}
                >
                  {t('admin.createSubcategory')}
                </Button>
              </div>
              {filteredSubs.length === 0 ? (
                <p className={styles.muted}>
                  {subcategories.length === 0 ? t('admin.subEmpty') : t('admin.subSearchEmpty')}
                </p>
              ) : (
                <>
                  <ul className={styles.productList}>
                    {pagedSubs.map((sub) => {
                      const categoryName =
                        categories.find((cat) => cat.id === sub.categoryId)?.name ?? sub.categorySlug
                      return (
                        <li key={sub.id} className={styles.productCard}>
                          <div className={styles.productTop}>
                            {sub.image ? (
                              <img src={sub.image} alt="" className={styles.thumb} />
                            ) : (
                              <div className={styles.thumb} />
                            )}
                            <div className={styles.productMeta}>
                              <h3 className={styles.productName}>{sub.name}</h3>
                              <p className={styles.productSku}>
                                {categoryName} · {sub.slug}
                              </p>
                            </div>
                            <div className={styles.rowActions}>
                              <Link
                                to={`/admin/subcategories/${sub.id}/edit`}
                                className={styles.iconAction}
                                aria-label={t('admin.edit')}
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                type="button"
                                className={styles.iconActionDanger}
                                aria-label={t('admin.remove')}
                                onClick={() => void handleDeleteSub(sub.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {subsTotalPages > 1 && (
                    <nav className={styles.pagination} aria-label={t('admin.subPaginationAria')}>
                      <motion.button
                        type="button"
                        className={styles.paginationBtn}
                        onClick={() => goToSubsPage(subsPage - 1)}
                        disabled={subsPage === 0}
                        aria-label={t('common.paginationPrev')}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      >
                        <ChevronLeft size={15} />
                      </motion.button>
                      <div className={styles.paginationNumbers}>
                        {subsVisiblePages.map((pageIndex) => {
                          const isActive = pageIndex === subsPage
                          return (
                            <motion.button
                              key={pageIndex}
                              type="button"
                              className={[
                                styles.paginationNumber,
                                isActive ? styles.paginationNumberActive : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => goToSubsPage(pageIndex)}
                              aria-label={t('common.paginationPage', { page: pageIndex + 1 })}
                              aria-current={isActive ? 'page' : undefined}
                              whileTap={{ scale: 0.92 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="adminSubsPaginationPill"
                                  className={styles.paginationPill}
                                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
                              )}
                              <span className={styles.paginationNumberLabel}>{pageIndex + 1}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                      <motion.button
                        type="button"
                        className={styles.paginationBtn}
                        onClick={() => goToSubsPage(subsPage + 1)}
                        disabled={subsPage >= subsTotalPages - 1}
                        aria-label={t('common.paginationNext')}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      >
                        <ChevronRight size={15} />
                      </motion.button>
                    </nav>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.panel}>
              <Input
                label={t('admin.tabUsers')}
                placeholder={t('admin.usersSearch')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {filteredUsers.length === 0 ? (
                <p className={styles.muted}>{t('admin.usersEmpty')}</p>
              ) : (
                <ul className={styles.productList}>
                  {filteredUsers.map((adminUser) => {
                    const draft = discountDrafts[adminUser.id] ?? { percent: '', label: '' }
                    return (
                      <li key={adminUser.id} className={styles.productCard}>
                        <div className={styles.productMeta}>
                          <h3 className={styles.productName}>
                            {adminUser.firstName} {adminUser.lastName}
                          </h3>
                          <p className={styles.productSku}>
                            {t('admin.usersContact')}:{' '}
                            {[adminUser.phone, adminUser.email].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                        <div className={styles.formGrid}>
                          <Input
                            label={t('admin.usersDiscount')}
                            type="number"
                            min={0}
                            max={100}
                            value={draft.percent}
                            onChange={(e) =>
                              setDiscountDrafts((d) => ({
                                ...d,
                                [adminUser.id]: { ...draft, percent: e.target.value },
                              }))
                            }
                          />
                          <Input
                            label={t('admin.usersDiscountLabel')}
                            value={draft.label}
                            onChange={(e) =>
                              setDiscountDrafts((d) => ({
                                ...d,
                                [adminUser.id]: { ...draft, label: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className={styles.formActions}>
                          <Button
                            size="sm"
                            loading={saving}
                            onClick={() => void saveUserDiscount(adminUser.id)}
                          >
                            {t('admin.usersSaveDiscount')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void saveUserDiscount(adminUser.id, true)}
                          >
                            {t('admin.usersClearDiscount')}
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
    </AdminShell>
  )
}
