import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Package,
  Pencil,
  Truck,
  CreditCard,
  MessageSquare,
} from 'lucide-react'
import type {
  CheckoutContact,
  CheckoutLocation,
  DeliveryMethod,
  NovaPoshtaCity,
  NovaPoshtaType,
  NovaPoshtaWarehouse,
  PaymentMethod,
  UkrposhtaType,
} from '@/types'
import { NovaPoshtaApi, OrdersApi } from '@/api'
import {
  NovaPoshtaIcon,
  UkrposhtaIcon,
  BankTransferIcon,
  CashOnDeliveryIcon,
  SelfPickupIcon,
} from '@/components/BrandIcons'
import { useAuthStore, useCartStore, useCheckoutStore, GUEST_CHECKOUT_PROFILE_KEY } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice, getDiscountLabel } from '@/utils'
import { formatPhoneDisplay, isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { Button, Breadcrumbs, Input, PhoneInput, EmptyState, Autocomplete } from '@/components/ui'
import type { AutocompleteOption } from '@/components/ui'
import styles from './CheckoutPage.module.scss'

type StepId = 1 | 2 | 3

type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'city'
  | 'address'
  | 'branch'
  | 'postalIndex'
  | 'payment'
  | 'payerFullName'

type FieldErrors = Partial<Record<FieldKey, boolean>>

const FIELD_STEP: Record<FieldKey, StepId> = {
  firstName: 1,
  lastName: 1,
  phone: 1,
  city: 2,
  address: 2,
  branch: 2,
  postalIndex: 2,
  payment: 3,
  payerFullName: 3,
}

const emptyLocation = (): CheckoutLocation => ({
  deliveryMethod: 'nova_poshta',
  novaPoshtaType: 'warehouse',
  ukrposhtaType: 'basic',
  city: '',
  cityRef: undefined,
  branch: '',
  warehouseRef: undefined,
  address: '',
  postalIndex: '',
})

type BankDetailFieldProps = {
  label: string
  value: string
  mono?: boolean
  copyLabel: string
  copiedLabel: string
}

function BankDetailField({ label, value, mono, copyLabel, copiedLabel }: BankDetailFieldProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={styles.bankDetailRow}>
      <span className={styles.bankDetailLabel}>{label}</span>
      <div className={styles.bankDetailValueRow}>
        <span className={mono ? styles.bankDetailValueMono : styles.bankDetailValue}>{value}</span>
        <button
          type="button"
          className={styles.bankDetailCopy}
          onClick={handleCopy}
          aria-label={copied ? copiedLabel : copyLabel}
          title={copied ? copiedLabel : copyLabel}
        >
          {copied ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2} />}
        </button>
      </div>
    </div>
  )
}

function formatWarehouseLabel(warehouse: NovaPoshtaWarehouse) {
  const number = warehouse.number || ''
  if (warehouse.cityName && number) {
    return `${warehouse.cityName} - ${number}`
  }
  return warehouse.name
}

function isValidUkrposhtaIndex(value: string) {
  return /^\d{5}$/.test(value.trim())
}

function StepBadge({
  step,
  expanded,
  done,
}: {
  step: number
  expanded: boolean
  done: boolean
}) {
  return (
    <span
      className={[
        styles.stepBadge,
        expanded && !done ? styles.active : '',
        done ? styles.done : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {done ? <Check size={16} strokeWidth={3} /> : step}
    </span>
  )
}

function CheckoutBlock({
  step,
  title,
  expanded,
  done,
  summary,
  onToggle,
  invalid,
  children,
}: {
  step: number
  title: string
  expanded: boolean
  done: boolean
  summary?: string
  onToggle: () => void
  invalid?: boolean
  children?: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <section
      className={[styles.block, invalid ? styles.blockInvalid : ''].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={[styles.blockHeader, styles.toggleable].join(' ')}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={expanded ? t('checkout.collapse') : t('checkout.expand')}
      >
        <StepBadge step={step} expanded={expanded} done={done} />
        <span className={styles.stepTitle}>
          {title}
          <span className={styles.required}>{t('checkout.required')}</span>
        </span>
        <span className={styles.collapseIcon} aria-hidden="true">
          <Pencil size={18} />
        </span>
      </button>

      {!expanded && done && summary && <p className={styles.summaryText}>{summary}</p>}

      {expanded && <div className={styles.blockBody}>{children}</div>}
    </section>
  )
}

export function CheckoutPage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const { items, getPricing, totalItems, clearCart } = useCartStore()
  const getProfile = useCheckoutStore((s) => s.getProfile)
  const saveContact = useCheckoutStore((s) => s.saveContact)
  const saveLocation = useCheckoutStore((s) => s.saveLocation)

  const profileKey = user?.id ?? GUEST_CHECKOUT_PROFILE_KEY

  const [expandedSteps, setExpandedSteps] = useState<Record<StepId, boolean>>({
    1: true,
    2: true,
    3: true,
  })
  const [contactDone, setContactDone] = useState(false)
  const [locationDone, setLocationDone] = useState(false)
  const [contact, setContact] = useState<CheckoutContact>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })
  const [location, setLocation] = useState<CheckoutLocation>(emptyLocation)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [payerFullName, setPayerFullName] = useState('')
  const [comment, setComment] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [errorStep, setErrorStep] = useState<StepId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const clearFieldError = (field: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const scrollToField = (field: FieldKey) => {
    window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-checkout-field="${field}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const focusable = el?.querySelector<HTMLElement>('input, button, textarea, [tabindex]')
      focusable?.focus({ preventScroll: true })
    }, 60)
  }

  const pricing = useMemo(
    () => getPricing(user?.discountPercent),
    [getPricing, items, user?.discountPercent],
  )
  const total = pricing.total
  const count = totalItems()
  const discountLabel = getDiscountLabel(pricing, t)

  const loadCityOptions = async (query: string): Promise<AutocompleteOption[]> => {
    const { items } = await NovaPoshtaApi.searchCities(query)
    return items.map((city) => ({
      id: city.ref,
      label: city.present,
      description:
        city.area && !city.present.toLocaleLowerCase('uk-UA').includes(city.area.toLocaleLowerCase('uk-UA'))
          ? city.area
          : undefined,
      data: city,
    }))
  }

  const loadWarehouseOptions = async (query: string): Promise<AutocompleteOption[]> => {
    if (!location.cityRef) return []
    const numberMatch = query.match(/(?:^|[\s\-—])(\d+)\s*$/)
    const searchQuery = numberMatch ? numberMatch[1] : query
    const { items } = await NovaPoshtaApi.searchWarehouses(location.cityRef, searchQuery)
    return items.map((warehouse) => ({
      id: warehouse.ref,
      label: formatWarehouseLabel(warehouse),
      description: warehouse.shortAddress || warehouse.name,
      data: warehouse,
    }))
  }

  useEffect(() => {
    const saved = getProfile(profileKey)
    const nextContact: CheckoutContact = {
      firstName: saved?.contact.firstName || user?.firstName || '',
      lastName: saved?.contact.lastName || user?.lastName || '',
      phone: saved?.contact.phone || user?.phone || '',
      email: saved?.contact.email || user?.email || '',
    }
    setContact(nextContact)

    const contactValid =
      Boolean(nextContact.firstName.trim()) &&
      Boolean(nextContact.lastName.trim()) &&
      isValidLocalPhone(nextContact.phone)

    if (saved?.location) {
      setLocation(saved.location)
    }

    const savedLocation = saved?.location
    const locationValid = (() => {
      if (!savedLocation) return false
      if (savedLocation.deliveryMethod === 'self_pickup') return true
      if (savedLocation.deliveryMethod === 'ukrposhta') {
        return isValidUkrposhtaIndex(savedLocation.postalIndex)
      }
      if (savedLocation.novaPoshtaType === 'courier') {
        return Boolean(savedLocation.city.trim()) && Boolean(savedLocation.cityRef) && Boolean(savedLocation.address.trim())
      }
      return (
        Boolean(savedLocation.city.trim()) &&
        Boolean(savedLocation.cityRef) &&
        Boolean(savedLocation.branch.trim()) &&
        Boolean(savedLocation.warehouseRef)
      )
    })()

    if (contactValid) {
      setContactDone(true)
      if (locationValid) {
        setLocationDone(true)
      }
    }
  }, [user, profileKey, getProfile])

  const isContactComplete = (value: CheckoutContact = contact) =>
    Boolean(value.firstName.trim()) &&
    Boolean(value.lastName.trim()) &&
    isValidLocalPhone(value.phone)

  const isLocationComplete = (value: CheckoutLocation = location) => {
    if (value.deliveryMethod === 'self_pickup') return true
    if (value.deliveryMethod === 'ukrposhta') {
      return isValidUkrposhtaIndex(value.postalIndex)
    }
    if (!value.city.trim() || !value.cityRef) return false
    if (value.novaPoshtaType === 'courier') return Boolean(value.address.trim())
    return Boolean(value.branch.trim()) && Boolean(value.warehouseRef)
  }

  useEffect(() => {
    if (!isContactComplete(contact)) {
      setContactDone(false)
      return
    }
    saveContact(profileKey, {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      phone: normalizeLocalPhone(contact.phone),
      email: contact.email.trim(),
    })
    setContactDone(true)
  }, [contact, profileKey, saveContact])

  useEffect(() => {
    if (!isLocationComplete(location)) {
      setLocationDone(false)
      return
    }
    saveLocation(profileKey, {
      deliveryMethod: location.deliveryMethod,
      novaPoshtaType: location.novaPoshtaType,
      ukrposhtaType: location.ukrposhtaType,
      city: location.city.trim(),
      cityRef: location.cityRef,
      branch: location.branch.trim(),
      warehouseRef: location.warehouseRef,
      address:
        location.deliveryMethod === 'self_pickup'
          ? t('checkout.selfPickupAddress')
          : location.address.trim(),
      postalIndex: location.postalIndex.trim(),
    })
    setLocationDone(true)
  }, [location, profileKey, saveLocation, language])

  const toggleStep = (step: StepId) => {
    setExpandedSteps((prev) => ({ ...prev, [step]: !prev[step] }))
  }

  if (!hydrated) return null

  if (success) {
    return (
      <div className={styles.page}>
        <div className="container">
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.successIcon}>
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h1 className={styles.successTitle}>{t('checkout.successTitle')}</h1>
            <p className={styles.successDescription}>
              {user ? t('checkout.successDescription') : t('checkout.successGuestDescription')}
            </p>
            {user ? (
              <div className={styles.successActions}>
                <Button as={Link} to="/profile" size="lg">
                  {t('checkout.goToOrders')}
                </Button>
                <Button as={Link} to="/profile#review" variant="secondary" size="lg">
                  {t('storeReviews.leaveReview')}
                </Button>
              </div>
            ) : (
              <div className={styles.successActions}>
                <Button as={Link} to="/catalog" size="lg">
                  {t('cart.continueShopping')}
                </Button>
                <Button as={Link} to="/about#leave-review" variant="secondary" size="lg">
                  {t('storeReviews.leaveReview')}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <EmptyState
            icon={<Package />}
            title={t('checkout.emptyCart')}
            action={{
              label: t('common.toCatalog'),
              onClick: () => navigate('/catalog'),
              variant: 'catalog',
            }}
          />
        </div>
      </div>
    )
  }

  const contactSummary = t('checkout.contactSummary', {
    name: `${contact.firstName} ${contact.lastName}`.trim(),
    phone: formatPhoneDisplay(contact.phone),
  })

  const locationSummary = (() => {
    if (location.deliveryMethod === 'self_pickup') {
      return t('checkout.locationSummarySelfPickup', {
        address: t('checkout.selfPickupAddress'),
      })
    }
    if (location.deliveryMethod === 'ukrposhta') {
      const type =
        location.ukrposhtaType === 'priority'
          ? t('checkout.ukrposhtaPriority')
          : t('checkout.ukrposhtaBasic')
      if (location.city.trim()) {
        return t('checkout.locationSummaryUkrposhtaIndex', {
          type,
          city: location.city,
          index: location.postalIndex,
        })
      }
      return t('checkout.locationSummaryUkrposhta', {
        type,
        index: location.postalIndex,
      })
    }
    if (location.novaPoshtaType === 'courier') {
      return t('checkout.locationSummaryCourier', {
        city: location.city,
        address: location.address,
      })
    }
    return t('checkout.locationSummaryBranch', {
      city: location.city,
      branch: location.branch,
    })
  })()

  const collectFieldErrors = (): { errors: FieldErrors; first: FieldKey | null; message: string | null } => {
    const errors: FieldErrors = {}

    if (!contact.firstName.trim()) errors.firstName = true
    if (!contact.lastName.trim()) errors.lastName = true
    if (!isValidLocalPhone(contact.phone)) errors.phone = true

    if (location.deliveryMethod === 'ukrposhta') {
      if (!isValidUkrposhtaIndex(location.postalIndex)) errors.postalIndex = true
    } else if (location.deliveryMethod === 'nova_poshta') {
      if (!location.city.trim() || !location.cityRef) errors.city = true
      if (location.novaPoshtaType === 'courier') {
        if (!location.address.trim()) errors.address = true
      } else if (!location.branch.trim() || !location.warehouseRef) {
        errors.branch = true
      }
    }

    if (!paymentMethod) errors.payment = true
    if (paymentMethod === 'bank_transfer' && !payerFullName.trim()) {
      errors.payerFullName = true
    }

    const order: FieldKey[] = [
      'firstName',
      'lastName',
      'phone',
      'city',
      'address',
      'branch',
      'postalIndex',
      'payment',
      'payerFullName',
    ]
    const first = order.find((key) => errors[key]) ?? null

    let message: string | null = null
    if (first === 'phone' && contact.phone.trim()) message = t('checkout.errorPhone')
    else if (first === 'postalIndex') message = t('checkout.errorPostalIndex')
    else if (first === 'city') message = t('checkout.errorCity')
    else if (first === 'address') message = t('checkout.errorAddress')
    else if (first === 'branch') message = t('checkout.errorBranch')
    else if (first === 'payment') message = t('checkout.errorPayment')
    else if (first === 'payerFullName') message = t('checkout.errorPayerFullName')
    else if (first) message = t('checkout.errorRequired')

    return { errors, first, message }
  }

  const buildLocationPayload = (): CheckoutLocation => ({
    deliveryMethod: location.deliveryMethod,
    novaPoshtaType: location.novaPoshtaType,
    ukrposhtaType: location.ukrposhtaType,
    city: location.city.trim(),
    cityRef: location.cityRef,
    branch: location.branch.trim(),
    warehouseRef: location.warehouseRef,
    address:
      location.deliveryMethod === 'self_pickup'
        ? t('checkout.selfPickupAddress')
        : location.address.trim(),
    postalIndex: location.postalIndex.trim(),
  })

  const setDeliveryMethod = (method: DeliveryMethod) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.city
      delete next.address
      delete next.branch
      delete next.postalIndex
      return next
    })
    setLocation((prev) => {
      const same = prev.deliveryMethod === method
      return {
        ...prev,
        deliveryMethod: method,
        city: same ? prev.city : '',
        cityRef: same ? prev.cityRef : undefined,
        branch: method === 'ukrposhta' ? '' : same ? prev.branch : '',
        warehouseRef: method === 'ukrposhta' ? undefined : same ? prev.warehouseRef : undefined,
        address: method === 'self_pickup' ? t('checkout.selfPickupAddress') : same ? prev.address : '',
        postalIndex: same ? prev.postalIndex : '',
      }
    })
  }

  const setNovaPoshtaType = (novaPoshtaType: NovaPoshtaType) => {
    setLocation((prev) => ({
      ...prev,
      novaPoshtaType,
      branch: novaPoshtaType === 'courier' ? '' : prev.branch,
      warehouseRef: novaPoshtaType === 'courier' ? undefined : prev.warehouseRef,
      address:
        novaPoshtaType === 'courier'
          ? ''
          : prev.warehouseRef
            ? prev.address
            : '',
    }))
  }

  const setUkrposhtaType = (ukrposhtaType: UkrposhtaType) => {
    setLocation((prev) => ({ ...prev, ukrposhtaType }))
  }

  const handleCityChange = (value: string) => {
    setLocation((prev) => ({
      ...prev,
      city: value,
      cityRef: undefined,
      branch: '',
      warehouseRef: undefined,
      address:
        prev.deliveryMethod === 'nova_poshta' && prev.novaPoshtaType === 'courier' ? prev.address : '',
      postalIndex: prev.deliveryMethod === 'ukrposhta' ? prev.postalIndex : '',
    }))
  }

  const handleCitySelect = (option: AutocompleteOption) => {
    const city = option.data as NovaPoshtaCity
    setLocation((prev) => ({
      ...prev,
      city: city.present || city.name,
      cityRef: city.ref,
      branch: '',
      warehouseRef: undefined,
      address: prev.novaPoshtaType === 'courier' ? prev.address : '',
      postalIndex: prev.deliveryMethod === 'ukrposhta' ? prev.postalIndex : '',
    }))
  }

  const handleBranchChange = (value: string) => {
    setLocation((prev) => ({
      ...prev,
      branch: value,
      warehouseRef: undefined,
      address: '',
    }))
  }

  const handleBranchSelect = (option: AutocompleteOption) => {
    const warehouse = option.data as NovaPoshtaWarehouse
    setLocation((prev) => ({
      ...prev,
      branch: formatWarehouseLabel(warehouse),
      warehouseRef: warehouse.ref,
      address: warehouse.shortAddress || warehouse.name,
    }))
  }

  const handlePlaceOrder = async () => {
    const { errors, first, message } = collectFieldErrors()

    if (first) {
      const step = FIELD_STEP[first]
      setFieldErrors(errors)
      setErrorStep(step)
      setError(message)
      setExpandedSteps((prev) => ({ ...prev, [step]: true }))
      scrollToField(first)
      return
    }

    setFieldErrors({})
    setContactDone(true)
    setLocationDone(true)
    saveContact(profileKey, {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      phone: normalizeLocalPhone(contact.phone),
      email: contact.email.trim(),
    })
    saveLocation(profileKey, buildLocationPayload())

    if (!paymentMethod) return

    setSubmitting(true)
    setError(null)
    setErrorStep(null)
    try {
      await OrdersApi.create({
        paymentMethod,
        deliveryMethod: location.deliveryMethod,
        language: language === 'en' ? 'en' : 'uk',
        ...(paymentMethod === 'bank_transfer'
          ? { payerFullName: payerFullName.trim() }
          : {}),
        ...(!user ? { items } : {}),
      })
      await clearCart()
      setSuccess(true)
    } catch {
      setError(t('checkout.errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)
    clearFieldError('payment')
    if (method !== 'bank_transfer') clearFieldError('payerFullName')
    setError(null)
    setErrorStep(null)
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: t('header.cart'), href: '/cart' },
            { label: t('checkout.breadcrumb') },
          ]}
        />

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('checkout.title')}
        </motion.h1>

        <div className={styles.layout}>
          <div className={styles.steps}>
            <CheckoutBlock
              step={1}
              title={t('checkout.stepContact')}
              expanded={expandedSteps[1]}
              done={contactDone}
              summary={contactSummary}
              onToggle={() => toggleStep(1)}
            >
              <div className={styles.formGrid}>
                <div data-checkout-field="firstName">
                  <Input
                    label={t('checkout.firstName')}
                    value={contact.firstName}
                    onChange={(e) => {
                      clearFieldError('firstName')
                      setContact((c) => ({ ...c, firstName: e.target.value }))
                    }}
                    autoComplete="given-name"
                    required
                    invalid={Boolean(fieldErrors.firstName)}
                  />
                </div>
                <div data-checkout-field="lastName">
                  <Input
                    label={t('checkout.lastName')}
                    value={contact.lastName}
                    onChange={(e) => {
                      clearFieldError('lastName')
                      setContact((c) => ({ ...c, lastName: e.target.value }))
                    }}
                    autoComplete="family-name"
                    required
                    invalid={Boolean(fieldErrors.lastName)}
                  />
                </div>
                <div className={styles.fullWidth} data-checkout-field="phone">
                  <PhoneInput
                    label={t('checkout.phone')}
                    value={contact.phone}
                    onChange={(phone) => {
                      clearFieldError('phone')
                      setContact((c) => ({ ...c, phone }))
                    }}
                    required
                    invalid={Boolean(fieldErrors.phone)}
                  />
                </div>
                <div className={styles.fullWidth}>
                  <Input
                    label={t('checkout.emailOptional')}
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    autoComplete="email"
                  />
                </div>
                {error && errorStep === 1 && <p className={`${styles.error} ${styles.fullWidth}`}>{error}</p>}
              </div>
            </CheckoutBlock>

            <CheckoutBlock
              step={2}
              title={t('checkout.stepLocation')}
              expanded={expandedSteps[2]}
              done={locationDone}
              summary={locationSummary}
              onToggle={() => toggleStep(2)}
            >
              <div>
                <p className={styles.optionTitle} style={{ marginBottom: 8 }}>
                  {t('checkout.deliveryMethod')}
                </p>
                <div className={styles.optionList}>
                  <div
                    className={[
                      styles.optionCard,
                      location.deliveryMethod === 'nova_poshta' ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className={styles.optionCardHeader}
                      onClick={() => setDeliveryMethod('nova_poshta')}
                    >
                      <span className={styles.radio}>
                        {location.deliveryMethod === 'nova_poshta' && <span className={styles.dot} />}
                      </span>
                      <span className={styles.optionIcon}>
                        <NovaPoshtaIcon />
                      </span>
                      <span className={styles.optionContent}>
                        <span className={styles.optionTitle}>{t('checkout.novaPoshta')}</span>
                        <span className={styles.optionHint}>{t('checkout.novaPoshtaHint')}</span>
                      </span>
                    </button>

                    {location.deliveryMethod === 'nova_poshta' && (
                      <div className={styles.optionCardBody}>
                        <div className={styles.subOptions}>
                          {(
                            [
                              ['warehouse', 'checkout.novaPoshtaWarehouse'],
                              ['parcel_locker', 'checkout.novaPoshtaParcelLocker'],
                              ['courier', 'checkout.novaPoshtaCourier'],
                            ] as const
                          ).map(([type, labelKey]) => (
                            <button
                              key={type}
                              type="button"
                              className={[
                                styles.subOption,
                                location.novaPoshtaType === type ? styles.subOptionSelected : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => setNovaPoshtaType(type)}
                            >
                              <span className={styles.radio}>
                                {location.novaPoshtaType === type && <span className={styles.dot} />}
                              </span>
                              <span>{t(labelKey)}</span>
                            </button>
                          ))}
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.fullWidth} data-checkout-field="city">
                            <Autocomplete
                              label={t('checkout.city')}
                              value={location.city}
                              onChange={(value) => {
                                clearFieldError('city')
                                handleCityChange(value)
                              }}
                              onSelect={(option) => {
                                clearFieldError('city')
                                handleCitySelect(option)
                              }}
                              loadOptions={loadCityOptions}
                              placeholder={t('checkout.cityPlaceholder')}
                              hint={location.cityRef ? undefined : t('checkout.cityHint')}
                              emptyMessage={t('checkout.searchEmpty')}
                              loadingMessage={t('checkout.searchLoading')}
                              required
                              invalid={Boolean(fieldErrors.city)}
                            />
                          </div>

                          {location.novaPoshtaType === 'courier' ? (
                            <div className={styles.fullWidth} data-checkout-field="address">
                              <Input
                                label={t('checkout.address')}
                                value={location.address}
                                onChange={(e) => {
                                  clearFieldError('address')
                                  setLocation((l) => ({ ...l, address: e.target.value }))
                                }}
                                placeholder={t('checkout.addressPlaceholder')}
                                autoComplete="street-address"
                                required
                                invalid={Boolean(fieldErrors.address)}
                              />
                            </div>
                          ) : (
                            <div className={styles.fullWidth} data-checkout-field="branch">
                              <Autocomplete
                                label={t('checkout.branch')}
                                value={location.branch}
                                onChange={(value) => {
                                  clearFieldError('branch')
                                  handleBranchChange(value)
                                }}
                                onSelect={(option) => {
                                  clearFieldError('branch')
                                  handleBranchSelect(option)
                                }}
                                loadOptions={loadWarehouseOptions}
                                placeholder={
                                  location.cityRef
                                    ? t('checkout.branchPlaceholder')
                                    : t('checkout.branchSelectCityFirst')
                                }
                                disabled={!location.cityRef}
                                minChars={0}
                                hint={
                                  location.warehouseRef && location.address
                                    ? t('checkout.branchAddressLabel', { address: location.address })
                                    : location.cityRef
                                      ? t('checkout.branchHint')
                                      : t('checkout.branchSelectCityFirst')
                                }
                                emptyMessage={t('checkout.searchEmpty')}
                                loadingMessage={t('checkout.searchLoading')}
                                required
                                invalid={Boolean(fieldErrors.branch)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={[
                      styles.optionCard,
                      location.deliveryMethod === 'ukrposhta' ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className={styles.optionCardHeader}
                      onClick={() => setDeliveryMethod('ukrposhta')}
                    >
                      <span className={styles.radio}>
                        {location.deliveryMethod === 'ukrposhta' && <span className={styles.dot} />}
                      </span>
                      <span className={styles.optionIcon}>
                        <UkrposhtaIcon />
                      </span>
                      <span className={styles.optionContent}>
                        <span className={styles.optionTitle}>{t('checkout.ukrposhta')}</span>
                        <span className={styles.optionHint}>{t('checkout.ukrposhtaHint')}</span>
                      </span>
                    </button>

                    {location.deliveryMethod === 'ukrposhta' && (
                      <div className={styles.optionCardBody}>
                        <div className={styles.subOptions}>
                          {(
                            [
                              ['basic', 'checkout.ukrposhtaBasic'],
                              ['priority', 'checkout.ukrposhtaPriority'],
                            ] as const
                          ).map(([type, labelKey]) => (
                            <button
                              key={type}
                              type="button"
                              className={[
                                styles.subOption,
                                location.ukrposhtaType === type ? styles.subOptionSelected : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => setUkrposhtaType(type)}
                            >
                              <span className={styles.radio}>
                                {location.ukrposhtaType === type && <span className={styles.dot} />}
                              </span>
                              <span>{t(labelKey)}</span>
                            </button>
                          ))}
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.fullWidth} data-checkout-field="postalIndex">
                            <Input
                              label={t('checkout.postalIndex')}
                              value={location.postalIndex}
                              onChange={(e) => {
                                clearFieldError('postalIndex')
                                setLocation((l) => ({
                                  ...l,
                                  postalIndex: e.target.value.replace(/\D/g, '').slice(0, 5),
                                }))
                              }}
                              placeholder={t('checkout.postalIndexPlaceholder')}
                              inputMode="numeric"
                              autoComplete="postal-code"
                              hint={t('checkout.ukrposhtaIndexHint')}
                              required
                              invalid={Boolean(fieldErrors.postalIndex)}
                            />
                          </div>

                          <div className={styles.fullWidth}>
                            <Autocomplete
                              label={t('checkout.ukrposhtaCityOptional')}
                              value={location.city}
                              onChange={handleCityChange}
                              onSelect={handleCitySelect}
                              loadOptions={loadCityOptions}
                              placeholder={t('checkout.cityPlaceholder')}
                              hint={t('checkout.ukrposhtaCityHint')}
                              emptyMessage={t('checkout.searchEmpty')}
                              loadingMessage={t('checkout.searchLoading')}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={[
                      styles.optionCard,
                      location.deliveryMethod === 'self_pickup' ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className={styles.optionCardHeader}
                      onClick={() => setDeliveryMethod('self_pickup')}
                    >
                      <span className={styles.radio}>
                        {location.deliveryMethod === 'self_pickup' && <span className={styles.dot} />}
                      </span>
                      <span className={styles.optionIcon}>
                        <SelfPickupIcon />
                      </span>
                      <span className={styles.optionContent}>
                        <span className={styles.optionTitle}>{t('checkout.selfPickup')}</span>
                        <span className={styles.optionHint}>{t('checkout.selfPickupHint')}</span>
                      </span>
                    </button>

                    {location.deliveryMethod === 'self_pickup' && (
                      <div className={styles.optionCardBody}>
                        <div className={styles.pickupAddress}>
                          <Truck size={18} />
                          <span>{t('checkout.selfPickupAddress')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && errorStep === 2 && <p className={styles.error}>{error}</p>}
              </div>
            </CheckoutBlock>

            <CheckoutBlock
              step={3}
              title={t('checkout.stepPayment')}
              expanded={expandedSteps[3]}
              done={Boolean(paymentMethod)}
              invalid={Boolean(fieldErrors.payment || fieldErrors.payerFullName)}
              onToggle={() => toggleStep(3)}
            >
              <div className={styles.optionList} data-checkout-field="payment">
                <div
                  className={[
                    styles.optionCard,
                    paymentMethod === 'bank_transfer' ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className={styles.optionCardHeader}
                    onClick={() => selectPaymentMethod('bank_transfer')}
                  >
                    <span className={styles.radio}>
                      {paymentMethod === 'bank_transfer' && <span className={styles.dot} />}
                    </span>
                    <span className={styles.optionIcon}>
                      <BankTransferIcon />
                    </span>
                    <span className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t('checkout.paymentBank')}</span>
                      <span className={styles.optionHint}>{t('checkout.paymentBankHint')}</span>
                    </span>
                  </button>
                  {paymentMethod === 'bank_transfer' && (
                    <div className={styles.optionCardBody}>
                      <div className={styles.bankDetails}>
                        <BankDetailField
                          label={t('checkout.paymentBankRecipientLabel')}
                          value={t('checkout.paymentBankRecipient')}
                          copyLabel={t('checkout.paymentBankCopy')}
                          copiedLabel={t('checkout.paymentBankCopied')}
                        />
                        <BankDetailField
                          label={t('checkout.paymentBankIbanLabel')}
                          value={t('checkout.paymentBankIban')}
                          mono
                          copyLabel={t('checkout.paymentBankCopy')}
                          copiedLabel={t('checkout.paymentBankCopied')}
                        />
                        <BankDetailField
                          label={t('checkout.paymentBankTaxIdLabel')}
                          value={t('checkout.paymentBankTaxId')}
                          mono
                          copyLabel={t('checkout.paymentBankCopy')}
                          copiedLabel={t('checkout.paymentBankCopied')}
                        />
                        <BankDetailField
                          label={t('checkout.paymentBankPurposeLabel')}
                          value={t('checkout.paymentBankPurpose')}
                          copyLabel={t('checkout.paymentBankCopy')}
                          copiedLabel={t('checkout.paymentBankCopied')}
                        />
                        <div className={styles.bankPayerField} data-checkout-field="payerFullName">
                          <Input
                            label={t('checkout.paymentBankPayerFullName')}
                            value={payerFullName}
                            onChange={(e) => {
                              clearFieldError('payerFullName')
                              setPayerFullName(e.target.value)
                            }}
                            placeholder={t('checkout.paymentBankPayerFullNamePlaceholder')}
                            hint={t('checkout.paymentBankPayerFullNameHint')}
                            autoComplete="name"
                            required
                            invalid={Boolean(fieldErrors.payerFullName)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={[
                    styles.optionCard,
                    paymentMethod === 'pickup' ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectPaymentMethod('pickup')}
                >
                  <span className={styles.radio}>
                    {paymentMethod === 'pickup' && <span className={styles.dot} />}
                  </span>
                  <span className={styles.optionIcon}>
                    <CashOnDeliveryIcon />
                  </span>
                  <span className={styles.optionContent}>
                    <span className={styles.optionTitle}>{t('checkout.paymentPickup')}</span>
                    <span className={styles.optionHint}>{t('checkout.paymentPickupHint')}</span>
                  </span>
                </button>
              </div>

              {error && errorStep === 3 && <p className={styles.error}>{error}</p>}
            </CheckoutBlock>

            <section className={styles.commentBlock}>
              <button
                type="button"
                className={styles.commentToggle}
                onClick={() => setCommentOpen((v) => !v)}
                aria-expanded={commentOpen}
              >
                <span className={styles.commentToggleLabel}>
                  <MessageSquare size={18} aria-hidden="true" />
                  {t('checkout.comment')}
                </span>
                {commentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {commentOpen && (
                <div className={styles.commentField}>
                  <textarea
                    className={styles.commentTextarea}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('checkout.commentPlaceholder')}
                    rows={2}
                  />
                </div>
              )}
            </section>
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>
            <div className={styles.summaryRow}>
              <span>{t('cart.itemsLabel')}</span>
              <span>{t('cart.itemsCount', { count })}</span>
            </div>
            {pricing.discountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(pricing.subtotal, language)}</span>
              </div>
            )}
            {pricing.discountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span>
                  {t('cart.discount')}
                  {discountLabel ? ` (${discountLabel})` : ''}
                </span>
                <span className={styles.discountAmount}>
                  −{formatPrice(pricing.discountAmount, language)}
                </span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>{t('cart.delivery')}</span>
              <span className={pricing.freeDelivery ? styles.deliveryFree : undefined}>
                {pricing.freeDelivery ? t('cart.deliveryFree') : t('cart.deliveryNote')}
              </span>
            </div>
            <div className={styles.totalRow}>
              <span>{t('checkout.toPay')}</span>
              <span className={styles.totalAmount}>{formatPrice(total, language)}</span>
            </div>
            <div className={styles.desktopSubmit}>
              <Button
                size="lg"
                fullWidth
                loading={submitting}
                rightIcon={<CreditCard size={18} />}
                onClick={() => void handlePlaceOrder()}
              >
                {t('checkout.placeOrder')}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <div className={styles.mobileBar}>
        <div className={styles.mobileBarTotal}>
          <span className={styles.mobileBarLabel}>{t('checkout.toPay')}</span>
          <span className={styles.mobileBarAmount}>{formatPrice(total, language)}</span>
        </div>
        <Button
          size="lg"
          loading={submitting}
          className={styles.mobileBarBtn}
          onClick={() => void handlePlaceOrder()}
        >
          {t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  )
}
