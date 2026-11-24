import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
  User,
} from 'lucide-react'
import type { AdminOrder } from '@/api'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { attributeValueEn, strandLengthEn } from '@/i18n/CatalogEn'
import { Button, Select } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { useCanHover } from '@/hooks/useMediaQuery'
import type { OrderStatus, PaymentStatus } from '@/types'
import { SALE_UNIT_OPTION_KEY, formatPrice, wristSizeNumber } from '@/utils'
import { formatPhoneDisplay } from '@/utils/phone'
import { formatOrderItemQuantity, orderItemUnitLabel } from '@/utils/orderItemDisplay'
import { optionsWithoutVariantId } from '@/utils/productVariants'
import { getVisiblePageNumbers } from './adminShared'
import adminStyles from './AdminPage.module.scss'
import styles from './AdminOrdersPanel.module.scss'

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

type Tone = NonNullable<SelectOption['tone']>

const PAYMENT_TONES: Record<PaymentStatus, Tone> = {
  unpaid: 'warning',
  awaiting_payment: 'info',
  paid: 'success',
  failed: 'danger',
}

const STATUS_TONES: Record<OrderStatus, Tone> = {
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

const OPTION_LABEL_KEYS: Record<string, TranslationKey> = {
  beadSize: 'productOptions.beadSize',
  beadCount: 'productOptions.beadCount',
  strandLength: 'productOptions.strandLength',
  saleUnit: 'productOptions.strandLength',
  length: 'productOptions.threadLength',
  color: 'productOptions.color',
  wristSize: 'productOptions.wristSize',
  packWeight: 'productOptions.packWeight',
  pieceWeight: 'productOptions.pieceWeight',
}

const DELIVERY_FILTERS = ['nova_poshta', 'ukrposhta', 'self_pickup'] as const
const ORDERS_PAGE_SIZE = 10
const ALL = 'all'
const OPEN_STATUSES = new Set<OrderStatus>([
  'pending',
  'confirmed',
  'processing',
  'assembling',
  'ready',
])

const TONE_CLASS: Record<Tone, string> = {
  neutral: styles.toneNeutral,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  info: styles.toneInfo,
}

function normalizeDelivery(method: string): string {
  return method === 'pickup' ? 'self_pickup' : method
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function orderNumber(order: AdminOrder): string {
  return order.id.slice(-8).toUpperCase()
}

function customerName(order: AdminOrder): string {
  if (!order.customer) return ''
  return `${order.customer.firstName} ${order.customer.lastName}`.trim()
}

function startOfDay(value: string): number {
  return new Date(`${value}T00:00:00`).getTime()
}

function endOfDay(value: string): number {
  return new Date(`${value}T23:59:59.999`).getTime()
}

function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function searchHaystack(order: AdminOrder): { text: string; digits: string } {
  const parts = [
    order.id,
    orderNumber(order),
    customerName(order),
    order.customer?.email,
    order.customer?.phone,
    order.deliveryAddress,
    order.payerFullName,
    ...order.items.flatMap((item) => [
      item.productName,
      ...Object.values(item.selectedOptions ?? {}),
    ]),
  ]
  const text = normalizeText(parts.filter(Boolean).join(' | '))
  return { text, digits: digitsOnly(order.customer?.phone ?? '') }
}

type AdminOrdersPanelProps = {
  orders: AdminOrder[]
  updatingOrderId: string | null
  onUpdate: (
    orderId: string,
    payload: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ) => void
}

export function AdminOrdersPanel({ orders, updatingOrderId, onUpdate }: AdminOrdersPanelProps) {
  const { t, language } = useTranslation()
  const canHover = useCanHover()
  const locale = language === 'uk' ? 'uk-UA' : 'en-US'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ALL)
  const [paymentFilter, setPaymentFilter] = useState<string>(ALL)
  const [deliveryFilter, setDeliveryFilter] = useState<string>(ALL)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)
  const [queue, setQueue] = useState<'open' | 'all'>('open')
  const [page, setPage] = useState(0)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const paymentMethodLabel = (method: string) => {
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

  const deliveryMethodLabel = (method: string) => {
    switch (normalizeDelivery(method)) {
      case 'nova_poshta':
        return t('checkout.novaPoshta')
      case 'ukrposhta':
        return t('checkout.ukrposhta')
      case 'self_pickup':
        return t('checkout.selfPickup')
      default:
        return method
    }
  }

  const formatOptionValue = (key: string, value: string) => {
    if (key === 'beadSize') return t('productOptions.beadSizeMm', { value })
    if (key === 'wristSize') return wristSizeNumber(value)
    if (key === 'beadCount') return t('productOptions.beadCountValue', { value })
    if (key === SALE_UNIT_OPTION_KEY) return t('productOptions.byTheBead')
    if (language === 'en') {
      if (key === 'strandLength') return strandLengthEn[value] ?? value.replace(/\s*см/gi, ' cm')
      return attributeValueEn[value] ?? value.replace(/\s*см/gi, ' cm')
    }
    return value
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const filtered = useMemo(() => {
    const q = normalizeText(search)
    const qDigits = digitsOnly(search)
    const from = dateFrom ? startOfDay(dateFrom) : null
    const to = dateTo ? endOfDay(dateTo) : null

    const list = orders.filter((order) => {
      if (statusFilter !== ALL && order.status !== statusFilter) return false
      if (statusFilter === ALL && queue === 'open' && !OPEN_STATUSES.has(order.status)) return false
      if (paymentFilter !== ALL && (order.paymentStatus ?? 'unpaid') !== paymentFilter) return false
      if (deliveryFilter !== ALL && normalizeDelivery(order.deliveryMethod) !== deliveryFilter) {
        return false
      }
      const created = new Date(order.createdAt).getTime()
      if (from !== null && created < from) return false
      if (to !== null && created > to) return false
      if (q) {
        const hay = searchHaystack(order)
        const matchesText = hay.text.includes(q)
        const matchesPhone = qDigits.length >= 3 && hay.digits.includes(qDigits)
        if (!matchesText && !matchesPhone) return false
      }
      return true
    })

    return list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return newestFirst ? -diff : diff
    })
  }, [orders, search, statusFilter, paymentFilter, deliveryFilter, dateFrom, dateTo, newestFirst, queue])

  const totalSum = useMemo(
    () => filtered.reduce((sum, order) => sum + order.totalPrice, 0),
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PAGE_SIZE))
  const visiblePages = getVisiblePageNumbers(page, totalPages)
  const paged = filtered.slice(page * ORDERS_PAGE_SIZE, (page + 1) * ORDERS_PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, paymentFilter, deliveryFilter, dateFrom, dateTo, newestFirst, queue])

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1))
  }, [page, totalPages])

  const hasFilters =
    search.trim() !== '' ||
    statusFilter !== ALL ||
    paymentFilter !== ALL ||
    deliveryFilter !== ALL ||
    dateFrom !== '' ||
    dateTo !== '' ||
    queue !== 'open'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter(ALL)
    setPaymentFilter(ALL)
    setDeliveryFilter(ALL)
    setDateFrom('')
    setDateTo('')
    setQueue('open')
  }

  const applyPreset = (days: number) => {
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - (days - 1))
    setDateFrom(toDateInput(start))
    setDateTo(toDateInput(today))
  }

  const presetActive = (days: number) => {
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - (days - 1))
    return dateFrom === toDateInput(start) && dateTo === toDateInput(today)
  }

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1600)
  }

  const shippingText = (order: AdminOrder) => {
    const lines = [
      `${t('admin.ordersShippingTemplate')}: ${customerName(order) || '—'}`,
      order.customer?.phone ? `${t('admin.ordersPhone')}: ${formatPhoneDisplay(order.customer.phone)}` : '',
      `${t('admin.ordersDelivery')}: ${deliveryMethodLabel(order.deliveryMethod)}`,
      order.deliveryAddress ? `${t('admin.ordersAddress')}: ${order.deliveryAddress}` : '',
    ]
    return lines.filter(Boolean).join('\n')
  }

  const renderPill = (label: string, tone: Tone) => (
    <span className={[styles.pill, TONE_CLASS[tone]].join(' ')}>{label}</span>
  )

  const renderCopy = (key: string, text: string, label: string) => (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={() => void copyText(key, text)}
      aria-label={label}
    >
      {copiedKey === key ? <Check size={14} /> : <Copy size={14} />}
      <span>{copiedKey === key ? t('admin.ordersCopied') : label}</span>
    </button>
  )

  const statusOptions: SelectOption[] = [
    { value: ALL, label: t('admin.ordersFilterAll') },
    ...ORDER_STATUSES.map((status) => ({
      value: status,
      label: t(`profile.orderStatus.${status}`),
      tone: STATUS_TONES[status],
    })),
  ]
  const paymentOptions: SelectOption[] = [
    { value: ALL, label: t('admin.ordersFilterAll') },
    ...PAYMENT_STATUSES.map((status) => ({
      value: status,
      label: t(`admin.paymentStatus.${status}`),
      tone: PAYMENT_TONES[status],
    })),
  ]
  const deliveryOptions: SelectOption[] = [
    { value: ALL, label: t('admin.ordersFilterAll') },
    ...DELIVERY_FILTERS.map((method) => ({ value: method, label: deliveryMethodLabel(method) })),
  ]

  return (
    <div className={adminStyles.panel}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t('admin.ordersSearch')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t('admin.tabOrders')}
        />
      </div>

      <div className={styles.filters}>
        <Select
          label={t('admin.ordersFilterStatus')}
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
        />
        <Select
          label={t('admin.ordersFilterPayment')}
          value={paymentFilter}
          options={paymentOptions}
          onChange={setPaymentFilter}
        />
        <Select
          label={t('admin.ordersFilterDelivery')}
          value={deliveryFilter}
          options={deliveryOptions}
          onChange={setDeliveryFilter}
        />
        <Select
          label={t('admin.ordersCreatedAt')}
          value={newestFirst ? 'new' : 'old'}
          options={[
            { value: 'new', label: t('admin.ordersSortNew') },
            { value: 'old', label: t('admin.ordersSortOld') },
          ]}
          onChange={(value) => setNewestFirst(value === 'new')}
        />
      </div>

      <div className={styles.dateRow}>
        <label className={styles.dateField}>
          <span>{t('admin.ordersDateFrom')}</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className={styles.dateField}>
          <span>{t('admin.ordersDateTo')}</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        <div className={styles.presets}>
          <button
            type="button"
            className={[styles.preset, queue === 'open' && statusFilter === ALL ? styles.presetActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              setQueue('open')
              setStatusFilter(ALL)
            }}
          >
            {t('admin.ordersQueueOpen')}
          </button>
          <button
            type="button"
            className={[styles.preset, queue === 'all' && statusFilter === ALL ? styles.presetActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              setQueue('all')
              setStatusFilter(ALL)
            }}
          >
            {t('admin.ordersQueueAll')}
          </button>
          {[
            { days: 1, label: t('admin.ordersToday') },
            { days: 7, label: t('admin.ordersWeek') },
            { days: 30, label: t('admin.ordersMonth') },
          ].map((preset) => (
            <button
              key={preset.days}
              type="button"
              className={[styles.preset, presetActive(preset.days) ? styles.presetActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summary}>
          {t('admin.ordersFound', {
            count: filtered.length,
            sum: formatPrice(totalSum, language),
          })}
        </span>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            {t('admin.ordersReset')}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className={adminStyles.muted}>{t('admin.ordersEmpty')}</p>
      ) : (
        <>
          <ul className={styles.list}>
            {paged.map((order) => {
              const expanded = expandedIds.has(order.id)
              const busy = updatingOrderId === order.id
              const paymentStatus = order.paymentStatus ?? 'unpaid'
              const unitsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const name = customerName(order)
              const isPickup = normalizeDelivery(order.deliveryMethod) === 'self_pickup'

              return (
                <li key={order.id} className={[styles.card, expanded ? styles.cardOpen : ''].join(' ')}>
                  <button
                    type="button"
                    className={styles.head}
                    onClick={() => toggleExpanded(order.id)}
                    aria-expanded={expanded}
                  >
                    <div className={styles.headMain}>
                      <div className={styles.headTop}>
                        <span className={styles.number}>#{orderNumber(order)}</span>
                        <span className={styles.date}>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className={styles.client}>
                        <User size={14} />
                        <strong>{name || t('admin.ordersGuest')}</strong>
                        {order.customer?.phone && (
                          <span className={styles.clientPhone}>
                            {formatPhoneDisplay(order.customer.phone)}
                          </span>
                        )}
                      </div>
                      <div className={styles.pills}>
                        {renderPill(
                          t(`profile.orderStatus.${order.status}`),
                          STATUS_TONES[order.status] ?? 'neutral',
                        )}
                        {renderPill(
                          t(`admin.paymentStatus.${paymentStatus}`),
                          PAYMENT_TONES[paymentStatus],
                        )}
                      </div>
                    </div>
                    <div className={styles.headSide}>
                      <span className={styles.total}>{formatPrice(order.totalPrice, language)}</span>
                      <span className={styles.positions}>
                        {t('admin.ordersPositions', { count: order.items.length })}
                        {' · '}
                        {t('admin.ordersItemQty', { count: unitsCount })}
                      </span>
                      <ChevronDown
                        size={18}
                        className={[styles.chevron, expanded ? styles.chevronOpen : '']
                          .filter(Boolean)
                          .join(' ')}
                      />
                    </div>
                  </button>

                  {!expanded && (
                    <div className={styles.pack}>
                      <div className={styles.packBlock}>
                        <p className={styles.packLabel}>{t('admin.ordersPackWhere')}</p>
                        <p className={styles.packWhere}>
                          {isPickup ? <Package size={14} /> : <Truck size={14} />}
                          <span>
                            <strong>{deliveryMethodLabel(order.deliveryMethod)}</strong>
                            {order.deliveryAddress ? ` — ${order.deliveryAddress}` : ` — ${t('admin.ordersNoAddress')}`}
                          </span>
                        </p>
                        {renderCopy(
                          `ship-${order.id}`,
                          shippingText(order),
                          t('admin.ordersCopyShipping'),
                        )}
                      </div>
                      <div className={styles.packBlock}>
                        <p className={styles.packLabel}>{t('admin.ordersPackWhat')}</p>
                        <ul className={styles.packItems}>
                          {order.items.map((item) => {
                            const options = Object.entries(optionsWithoutVariantId(item.selectedOptions))
                            return (
                              <li key={item.id}>
                                <span className={styles.packQty}>
                                  {formatOrderItemQuantity(item, language)}
                                </span>
                                <span className={styles.packItemText}>
                                  <span className={styles.packName}>{item.productName}</span>
                                  {options.length > 0 && (
                                    <span className={styles.packOptions}>
                                      {options
                                        .map(([key, value]) => {
                                          const label = OPTION_LABEL_KEYS[key]
                                            ? t(OPTION_LABEL_KEYS[key])
                                            : key
                                          return `${label}: ${formatOptionValue(key, value)}`
                                        })
                                        .join(' · ')}
                                    </span>
                                  )}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      {order.paymentMethod === 'bank_transfer' && (
                        <div className={styles.packBlock}>
                          <p className={styles.packLabel}>{t('admin.ordersProof')}</p>
                          {order.paymentProofUrl ? (
                            <a
                              className={styles.proofLink}
                              href={order.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img src={order.paymentProofUrl} alt="" />
                            </a>
                          ) : (
                            <span className={[styles.pill, styles.toneWarning].join(' ')}>
                              {t('admin.ordersNoProof')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        className={styles.body}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={styles.bodyInner}>
                          <div className={styles.infoGrid}>
                            <section className={styles.infoBlock}>
                              <h4 className={styles.infoTitle}>
                                <User size={15} /> {t('admin.ordersClientSection')}
                              </h4>
                              <p className={styles.infoStrong}>{name || t('admin.ordersGuest')}</p>
                              {order.customer?.phone && (
                                <p className={styles.infoRow}>
                                  <Phone size={14} />
                                  <a href={`tel:${order.customer.phone}`}>
                                    {formatPhoneDisplay(order.customer.phone)}
                                  </a>
                                </p>
                              )}
                              {order.customer?.email && (
                                <p className={styles.infoRow}>
                                  <Mail size={14} />
                                  <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                                </p>
                              )}
                              <p className={styles.infoHint}>
                                {order.userId ? t('admin.ordersRegistered') : t('admin.ordersGuest')}
                              </p>
                              {(order.customer?.phone || name) && (
                                <button
                                  type="button"
                                  className={styles.linkBtn}
                                  onClick={() =>
                                    setSearch(order.customer?.phone ? digitsOnly(order.customer.phone) : name)
                                  }
                                >
                                  {t('admin.ordersFilterClient')}
                                </button>
                              )}
                            </section>

                            <section className={[styles.infoBlock, styles.infoShip].join(' ')}>
                              <h4 className={styles.infoTitle}>
                                <MapPin size={15} /> {t('admin.ordersShipTo')}
                              </h4>
                              <p className={styles.infoStrong}>{deliveryMethodLabel(order.deliveryMethod)}</p>
                              <p className={styles.address}>
                                {order.deliveryAddress || t('admin.ordersNoAddress')}
                              </p>
                              <div className={styles.copyRow}>
                                {renderCopy(
                                  `ship-${order.id}`,
                                  shippingText(order),
                                  t('admin.ordersCopyShipping'),
                                )}
                              </div>
                            </section>

                            <section className={styles.infoBlock}>
                              <h4 className={styles.infoTitle}>
                                <CreditCard size={15} /> {t('admin.ordersPaymentSection')}
                              </h4>
                              <p className={styles.infoStrong}>{paymentMethodLabel(order.paymentMethod)}</p>
                              {(order.paymentMethod === 'bank_transfer' || order.payerFullName) && (
                                <p className={styles.infoRow}>
                                  {t('admin.ordersPayerFullName')}:{' '}
                                  <strong>{order.payerFullName?.trim() || '—'}</strong>
                                </p>
                              )}
                              {(order.paymentMethod === 'pickup' || order.paymentMethod === 'cod') && (
                                <p className={styles.infoHint}>{t('admin.ordersCodHint')}</p>
                              )}
                              {order.paymentMethod === 'bank_transfer' &&
                                (order.paymentProofUrl ? (
                                  <a
                                    className={styles.proofLink}
                                    href={order.paymentProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img src={order.paymentProofUrl} alt={t('admin.ordersProof')} />
                                  </a>
                                ) : (
                                  <p className={styles.infoHint}>{t('admin.ordersNoProof')}</p>
                                ))}
                              <p className={styles.infoHint}>
                                {t('admin.ordersCreatedAt')}: {formatDate(order.createdAt)}
                              </p>
                              <p className={styles.infoHint}>ID: {order.id}</p>
                            </section>
                          </div>

                          <div className={styles.controls}>
                            <Select
                              label={t('admin.ordersPayment')}
                              value={paymentStatus}
                              disabled={busy}
                              options={PAYMENT_STATUSES.map((status) => ({
                                value: status,
                                label: t(`admin.paymentStatus.${status}`),
                                tone: PAYMENT_TONES[status],
                              }))}
                              onChange={(next) => onUpdate(order.id, { paymentStatus: next as PaymentStatus })}
                            />
                            <Select
                              label={t('admin.ordersFulfillment')}
                              value={order.status}
                              disabled={busy}
                              options={ORDER_STATUSES.map((status) => ({
                                value: status,
                                label: t(`profile.orderStatus.${status}`),
                                tone: STATUS_TONES[status],
                              }))}
                              onChange={(next) => onUpdate(order.id, { status: next as OrderStatus })}
                            />
                          </div>

                          <h4 className={styles.itemsTitle}>
                            {t('admin.ordersItemsSection')}
                            <span>{t('admin.ordersPositions', { count: order.items.length })}</span>
                          </h4>
                          <ul className={styles.items}>
                            {order.items.map((item) => {
                              const options = Object.entries(optionsWithoutVariantId(item.selectedOptions))
                              return (
                                <li key={item.id} className={styles.item}>
                                  <div className={styles.itemImage}>
                                    {item.productImage ? <img src={item.productImage} alt="" /> : null}
                                  </div>
                                  <div className={styles.itemBody}>
                                    <span className={styles.itemName}>{item.productName}</span>
                                    {options.length > 0 && (
                                      <div className={styles.chips}>
                                        {options.map(([key, value]) => (
                                          <span key={key} className={styles.chip}>
                                            {OPTION_LABEL_KEYS[key] ? t(OPTION_LABEL_KEYS[key]) : key}:{' '}
                                            <strong>{formatOptionValue(key, value)}</strong>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <span className={styles.itemMeta}>
                                      {formatPrice(item.price, language)} / {orderItemUnitLabel(item, language)}
                                      {' × '}
                                      <strong>{t('admin.ordersItemQty', { count: formatOrderItemQuantity(item, language) })}</strong>
                                    </span>
                                    {!item.productId && (
                                      <span className={styles.itemWarn}>{t('admin.ordersProductDeleted')}</span>
                                    )}
                                  </div>
                                  <span className={styles.itemTotal}>
                                    {formatPrice(item.price * item.quantity, language)}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                          <div className={styles.totalRow}>
                            <span>{t('admin.ordersTotal')}</span>
                            <strong>{formatPrice(order.totalPrice, language)}</strong>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <nav className={adminStyles.pagination} aria-label={t('admin.ordersPaginationAria')}>
              <motion.button
                type="button"
                className={adminStyles.paginationBtn}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label={t('common.paginationPrev')}
                whileTap={canHover ? { scale: 0.9 } : undefined}
              >
                <ChevronLeft size={15} />
              </motion.button>
              <div className={adminStyles.paginationNumbers}>
                {visiblePages.map((pageIndex) => {
                  const isActive = pageIndex === page
                  return (
                    <motion.button
                      key={pageIndex}
                      type="button"
                      className={[
                        adminStyles.paginationNumber,
                        isActive ? adminStyles.paginationNumberActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setPage(pageIndex)}
                      aria-label={t('common.paginationPage', { page: pageIndex + 1 })}
                      aria-current={isActive ? 'page' : undefined}
                      whileTap={canHover ? { scale: 0.92 } : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="adminOrdersPaginationPill"
                          className={adminStyles.paginationPill}
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className={adminStyles.paginationNumberLabel}>{pageIndex + 1}</span>
                    </motion.button>
                  )
                })}
              </div>
              <motion.button
                type="button"
                className={adminStyles.paginationBtn}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label={t('common.paginationNext')}
                whileTap={canHover ? { scale: 0.9 } : undefined}
              >
                <ChevronRight size={15} />
              </motion.button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
