import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronUp,
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
import { useAuthStore, useCartStore, useCheckoutStore, GUEST_CHECKOUT_PROFILE_KEY } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice, getDiscountLabel } from '@/utils'
import { formatPhoneDisplay, isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { Button, Breadcrumbs, Input, PhoneInput, EmptyState, Autocomplete } from '@/components/ui'
import type { AutocompleteOption } from '@/components/ui'
import styles from './CheckoutPage.module.scss'

type StepId = 1 | 2 | 3

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

function NovaPoshtaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#E30613" />
      <path
        fill="#fff"
        d="M14 5.2 8.2 11h3.1v5.2h5.4V11h3.1L14 5.2Zm-5.8 12.2v5.4h11.6v-5.4h-2.7v2.7H11v-2.7H8.2Z"
      />
    </svg>
  )
}

function UkrposhtaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#FFCC00" />
      <path
        fill="#0057B8"
        d="M6.5 9.2h15v1.7H6.5V9.2Zm0 4h15v1.7H6.5v-1.7Zm0 4h15v1.7H6.5v-1.7Z"
      />
      <circle cx="14" cy="14" r="3.2" fill="#0057B8" />
      <circle cx="14" cy="14" r="1.5" fill="#FFCC00" />
    </svg>
  )
}

function SelfPickupIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#12B76A" />
      <path
        fill="#fff"
        d="M7 12.2 14 6.8l7 5.4v9.5a1.2 1.2 0 0 1-1.2 1.2H8.2A1.2 1.2 0 0 1 7 21.7v-9.5Zm3.2 2.3v6.2h2.6v-4h2.4v4h2.6v-6.2H10.2Z"
      />
    </svg>
  )
}

function BankTransferIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#4F46E5" />
      <path
        fill="#fff"
        d="M7.5 9.2h13v1.6H7.5V9.2Zm1.2 3.2h10.6v9.2H8.7v-9.2Zm2 2.2v1.4h6.6v-1.4H10.7Zm0 2.8v1.4h6.6v-1.4H10.7Zm0 2.8v1.4h4.2v-1.4h-4.2Z"
      />
    </svg>
  )
}

function WalletPayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#0EA5E9" />
      <path
        fill="#fff"
        d="M7 9.5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 21 21.5H7A1.5 1.5 0 0 1 5.5 20v-9A1.5 1.5 0 0 1 7 9.5Zm12.2 5.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z"
      />
      <path fill="#BAE6FD" d="M5.5 11.2h17v2.2h-17z" />
    </svg>
  )
}

function CardPayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#059669" />
      <path fill="#A7F3D0" d="M5.5 10.2h17v2.4h-17z" />
      <path
        fill="#fff"
        d="M5.5 9a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 22.5 9v10a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V9Zm2.2 7.2h5.2v1.5H7.7v-1.5Zm8.4 0h4.2v1.5h-4.2v-1.5Z"
      />
    </svg>
  )
}

function redirectToLiqPay(payment: { data: string; signature: string; checkoutUrl: string }) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = payment.checkoutUrl
  form.acceptCharset = 'utf-8'
  form.style.display = 'none'

  const dataInput = document.createElement('input')
  dataInput.type = 'hidden'
  dataInput.name = 'data'
  dataInput.value = payment.data
  form.appendChild(dataInput)

  const signatureInput = document.createElement('input')
  signatureInput.type = 'hidden'
  signatureInput.name = 'signature'
  signatureInput.value = payment.signature
  form.appendChild(signatureInput)

  document.body.appendChild(form)
  form.submit()
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
  children,
}: {
  step: number
  title: string
  expanded: boolean
  done: boolean
  summary?: string
  onToggle: () => void
  children?: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <section className={styles.block}>
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
  const [comment, setComment] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [errorStep, setErrorStep] = useState<StepId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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
        return (
          Boolean(savedLocation.city.trim()) &&
          isValidUkrposhtaIndex(savedLocation.postalIndex)
        )
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
              <Button as={Link} to="/profile" size="lg">
                {t('checkout.goToOrders')}
              </Button>
            ) : (
              <Button as={Link} to="/catalog" size="lg">
                {t('cart.continueShopping')}
              </Button>
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
      if (location.branch.trim()) {
        return t('checkout.locationSummaryUkrposhta', {
          type,
          city: location.city,
          branch: location.branch,
          index: location.postalIndex,
        })
      }
      return t('checkout.locationSummaryUkrposhtaIndex', {
        type,
        city: location.city,
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

  const isContactComplete = (value: CheckoutContact = contact) =>
    Boolean(value.firstName.trim()) &&
    Boolean(value.lastName.trim()) &&
    isValidLocalPhone(value.phone)

  const isLocationComplete = (value: CheckoutLocation = location) => {
    if (value.deliveryMethod === 'self_pickup') return true
    if (value.deliveryMethod === 'ukrposhta') {
      return Boolean(value.city.trim()) && isValidUkrposhtaIndex(value.postalIndex)
    }
    if (!value.city.trim() || !value.cityRef) return false
    if (value.novaPoshtaType === 'courier') return Boolean(value.address.trim())
    return Boolean(value.branch.trim()) && Boolean(value.warehouseRef)
  }

  const validateContact = () => {
    if (!isContactComplete()) {
      setErrorStep(1)
      setError(
        !isValidLocalPhone(contact.phone) && contact.phone.trim()
          ? t('checkout.errorPhone')
          : t('checkout.errorRequired'),
      )
      return false
    }
    setErrorStep(null)
    setError(null)
    return true
  }

  const validateLocation = () => {
    if (location.deliveryMethod === 'self_pickup') {
      setErrorStep(null)
      setError(null)
      return true
    }

    if (location.deliveryMethod === 'ukrposhta') {
      if (!location.city.trim()) {
        setErrorStep(2)
        setError(t('checkout.errorCity'))
        return false
      }
      if (!isValidUkrposhtaIndex(location.postalIndex)) {
        setErrorStep(2)
        setError(t('checkout.errorPostalIndex'))
        return false
      }
      setErrorStep(null)
      setError(null)
      return true
    }

    // Nova Poshta
    if (!location.city.trim() || !location.cityRef) {
      setErrorStep(2)
      setError(t('checkout.errorCity'))
      return false
    }
    if (location.novaPoshtaType === 'courier') {
      if (!location.address.trim()) {
        setErrorStep(2)
        setError(t('checkout.errorAddress'))
        return false
      }
    } else if (!location.branch.trim() || !location.warehouseRef) {
      setErrorStep(2)
      setError(t('checkout.errorBranch'))
      return false
    }
    setErrorStep(null)
    setError(null)
    return true
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

  const setDeliveryMethod = (method: DeliveryMethod) => {
    setLocation((prev) => {
      const same = prev.deliveryMethod === method
      return {
        ...prev,
        deliveryMethod: method,
        city: same ? prev.city : '',
        cityRef: same ? prev.cityRef : undefined,
        branch: same ? prev.branch : '',
        warehouseRef: same ? prev.warehouseRef : undefined,
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
      branch: prev.deliveryMethod === 'ukrposhta' ? prev.branch : '',
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
      branch: prev.deliveryMethod === 'ukrposhta' ? prev.branch : '',
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
    const contactValid = validateContact()
    const locationValid = validateLocation()

    if (!contactValid) {
      setExpandedSteps((prev) => ({ ...prev, 1: true }))
      return
    }
    if (!locationValid) {
      setExpandedSteps((prev) => ({ ...prev, 2: true }))
      return
    }

    setContactDone(true)
    setLocationDone(true)
    saveContact(profileKey, {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      phone: normalizeLocalPhone(contact.phone),
      email: contact.email.trim(),
    })
    saveLocation(profileKey, buildLocationPayload())

    if (!paymentMethod) {
      setErrorStep(3)
      setError(t('checkout.errorPayment'))
      setExpandedSteps((prev) => ({ ...prev, 3: true }))
      return
    }

    setSubmitting(true)
    setError(null)
    setErrorStep(null)
    try {
      const result = await OrdersApi.create({
        paymentMethod,
        deliveryMethod: location.deliveryMethod,
        language: language === 'en' ? 'en' : 'uk',
        ...(!user ? { items } : {}),
      })
      await clearCart()

      if (paymentMethod === 'liqpay' && result.payment) {
        redirectToLiqPay(result.payment)
        return
      }

      setSuccess(true)
    } catch {
      setError(t('checkout.errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)
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
                <Input
                  label={t('checkout.firstName')}
                  value={contact.firstName}
                  onChange={(e) => setContact((c) => ({ ...c, firstName: e.target.value }))}
                  autoComplete="given-name"
                  required
                />
                <Input
                  label={t('checkout.lastName')}
                  value={contact.lastName}
                  onChange={(e) => setContact((c) => ({ ...c, lastName: e.target.value }))}
                  autoComplete="family-name"
                  required
                />
                <div className={styles.fullWidth}>
                  <PhoneInput
                    label={t('checkout.phone')}
                    value={contact.phone}
                    onChange={(phone) => setContact((c) => ({ ...c, phone }))}
                    required
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
                          <div className={styles.fullWidth}>
                            <Autocomplete
                              label={t('checkout.city')}
                              value={location.city}
                              onChange={handleCityChange}
                              onSelect={handleCitySelect}
                              loadOptions={loadCityOptions}
                              placeholder={t('checkout.cityPlaceholder')}
                              hint={location.cityRef ? undefined : t('checkout.cityHint')}
                              emptyMessage={t('checkout.searchEmpty')}
                              loadingMessage={t('checkout.searchLoading')}
                              required
                            />
                          </div>

                          {location.novaPoshtaType === 'courier' ? (
                            <div className={styles.fullWidth}>
                              <Input
                                label={t('checkout.address')}
                                value={location.address}
                                onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))}
                                placeholder={t('checkout.addressPlaceholder')}
                                autoComplete="street-address"
                                required
                              />
                            </div>
                          ) : (
                            <div className={styles.fullWidth}>
                              <Autocomplete
                                label={t('checkout.branch')}
                                value={location.branch}
                                onChange={handleBranchChange}
                                onSelect={handleBranchSelect}
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
                          <div className={styles.fullWidth}>
                            <Autocomplete
                              label={t('checkout.city')}
                              value={location.city}
                              onChange={handleCityChange}
                              onSelect={handleCitySelect}
                              loadOptions={loadCityOptions}
                              placeholder={t('checkout.cityPlaceholder')}
                              hint={t('checkout.ukrposhtaCityHint')}
                              emptyMessage={t('checkout.searchEmpty')}
                              loadingMessage={t('checkout.searchLoading')}
                              required
                            />
                          </div>

                          <div className={styles.fullWidth}>
                            <Input
                              label={t('checkout.postalIndex')}
                              value={location.postalIndex}
                              onChange={(e) =>
                                setLocation((l) => ({
                                  ...l,
                                  postalIndex: e.target.value.replace(/\D/g, '').slice(0, 5),
                                }))
                              }
                              placeholder={t('checkout.postalIndexPlaceholder')}
                              inputMode="numeric"
                              autoComplete="postal-code"
                              hint={t('checkout.ukrposhtaIndexHint')}
                              required
                            />
                          </div>

                          <div className={styles.fullWidth}>
                            <Input
                              label={t('checkout.ukrposhtaBranchManual')}
                              value={location.branch}
                              onChange={(e) =>
                                setLocation((l) => ({
                                  ...l,
                                  branch: e.target.value,
                                  warehouseRef: undefined,
                                }))
                              }
                              placeholder={t('checkout.ukrposhtaBranchManualPlaceholder')}
                              hint={t('checkout.ukrposhtaBranchManualHint')}
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
              onToggle={() => toggleStep(3)}
            >
              <div className={styles.optionList}>
                <button
                  type="button"
                  className={[
                    styles.optionCard,
                    paymentMethod === 'bank_transfer' ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
                    {paymentMethod === 'bank_transfer' && (
                      <div className={styles.bankDetails}>
                        <div className={styles.bankDetailRow}>
                          <span className={styles.bankDetailLabel}>
                            {t('checkout.paymentBankRecipientLabel')}
                          </span>
                          <span className={styles.bankDetailValue}>
                            {t('checkout.paymentBankRecipient')}
                          </span>
                        </div>
                        <div className={styles.bankDetailRow}>
                          <span className={styles.bankDetailLabel}>
                            {t('checkout.paymentBankIbanLabel')}
                          </span>
                          <span className={styles.bankDetailValueMono}>
                            {t('checkout.paymentBankIban')}
                          </span>
                        </div>
                        <div className={styles.bankDetailRow}>
                          <span className={styles.bankDetailLabel}>
                            {t('checkout.paymentBankTaxIdLabel')}
                          </span>
                          <span className={styles.bankDetailValueMono}>
                            {t('checkout.paymentBankTaxId')}
                          </span>
                        </div>
                        <div className={styles.bankDetailRow}>
                          <span className={styles.bankDetailLabel}>
                            {t('checkout.paymentBankPurposeLabel')}
                          </span>
                          <span className={styles.bankDetailValue}>
                            {t('checkout.paymentBankPurpose')}
                          </span>
                        </div>
                      </div>
                    )}
                  </span>
                </button>

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
                    <WalletPayIcon />
                  </span>
                  <span className={styles.optionContent}>
                    <span className={styles.optionTitle}>{t('checkout.paymentPickup')}</span>
                    <span className={styles.optionHint}>{t('checkout.paymentPickupHint')}</span>
                  </span>
                </button>

                <button
                  type="button"
                  className={[
                    styles.optionCard,
                    paymentMethod === 'liqpay' ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectPaymentMethod('liqpay')}
                >
                  <span className={styles.radio}>
                    {paymentMethod === 'liqpay' && <span className={styles.dot} />}
                  </span>
                  <span className={styles.optionIcon}>
                    <CardPayIcon />
                  </span>
                  <span className={styles.optionContent}>
                    <span className={styles.optionTitle}>{t('checkout.paymentOnline')}</span>
                    <span className={styles.optionHint}>{t('checkout.paymentOnlineHint')}</span>
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
                disabled={!paymentMethod}
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
          disabled={!paymentMethod}
          className={styles.mobileBarBtn}
          onClick={() => void handlePlaceOrder()}
        >
          {t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  )
}
