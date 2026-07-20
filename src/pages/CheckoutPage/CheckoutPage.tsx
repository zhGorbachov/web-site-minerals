import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  Truck,
  Wallet,
  CreditCard,
} from 'lucide-react'
import type {
  CheckoutContact,
  CheckoutLocation,
  DeliveryMethod,
  NovaPoshtaCity,
  NovaPoshtaWarehouse,
  PaymentMethod,
} from '@/types'
import { NovaPoshtaApi, OrdersApi } from '@/api'
import { useAuthStore, useCartStore, useCheckoutStore, GUEST_CHECKOUT_PROFILE_KEY } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils'
import { formatPhoneDisplay, isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { Button, Breadcrumbs, Input, PhoneInput, EmptyState, Autocomplete } from '@/components/ui'
import type { AutocompleteOption } from '@/components/ui'
import styles from './CheckoutPage.module.scss'

type StepId = 1 | 2 | 3

function formatWarehouseLabel(warehouse: NovaPoshtaWarehouse) {
  const number = warehouse.number || ''
  if (warehouse.cityName && number) {
    return `${warehouse.cityName} - ${number}`
  }
  return warehouse.name
}

function GooglePayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M12.24 10.285V14.4h6.806c-.275 1.41-1.64 4.13-6.806 4.13-4.1 0-7.44-3.4-7.44-7.53s3.34-7.53 7.44-7.53c2.33 0 3.9.99 4.79 1.85l3.26-3.14C18.86.89 15.89-.2 12.24-.2 5.97-.2.9 4.87.9 11s5.07 11.2 11.34 11.2c6.55 0 10.88-4.6 10.88-11.07 0-.74-.08-1.3-.18-1.86H12.24z"
        transform="translate(0 1)"
      />
    </svg>
  )
}

function ApplePayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 12.84c-.03-3.04 2.48-4.5 2.59-4.57-1.41-2.06-3.61-2.34-4.39-2.37-1.87-.19-3.65 1.1-4.6 1.1-.96 0-2.43-1.08-4-1.05-2.05.03-3.95 1.2-5 3.04-2.14 3.71-.55 9.2 1.53 12.21 1.02 1.48 2.24 3.13 3.84 3.07 1.54-.06 2.12-1 3.98-1 1.85 0 2.38.99 4 0.96 1.66-.03 2.71-1.5 3.72-2.99 1.17-1.71 1.65-3.37 1.68-3.45-.04-.02-3.22-1.24-3.25-4.95zM13.88 4.5c.84-1.02 1.41-2.44 1.25-3.86-1.21.05-2.67.81-3.54 1.82-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.57-1.68z"
      />
    </svg>
  )
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
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {!expanded && done && summary && <p className={styles.summaryText}>{summary}</p>}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className={styles.blockBody}
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function CheckoutPage() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const { items, totalPrice, totalItems, clearCart } = useCartStore()
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
  const [location, setLocation] = useState<CheckoutLocation>({
    deliveryMethod: 'nova_poshta',
    city: '',
    cityRef: undefined,
    branch: '',
    warehouseRef: undefined,
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [comment, setComment] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [errorStep, setErrorStep] = useState<StepId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const total = totalPrice()
  const count = totalItems()

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

    const locationValid =
      Boolean(saved?.location?.city.trim()) &&
      Boolean(saved?.location?.cityRef) &&
      (saved?.location.deliveryMethod === 'courier'
        ? Boolean(saved.location.address.trim())
        : Boolean(saved?.location.branch.trim()) && Boolean(saved?.location.warehouseRef))

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

  const locationSummary =
    location.deliveryMethod === 'nova_poshta'
      ? t('checkout.locationSummaryBranch', {
          city: location.city,
          branch: location.branch,
        })
      : t('checkout.locationSummaryCourier', {
          city: location.city,
          address: location.address,
        })

  const validateContact = () => {
    if (!contact.firstName.trim() || !contact.lastName.trim()) {
      setErrorStep(1)
      setError(t('checkout.errorRequired'))
      return false
    }
    if (!isValidLocalPhone(contact.phone)) {
      setErrorStep(1)
      setError(t('checkout.errorPhone'))
      return false
    }
    setErrorStep(null)
    setError(null)
    return true
  }

  const validateLocation = () => {
    if (!location.city.trim() || !location.cityRef) {
      setErrorStep(2)
      setError(t('checkout.errorCity'))
      return false
    }
    if (location.deliveryMethod === 'nova_poshta') {
      if (!location.branch.trim() || !location.warehouseRef) {
        setErrorStep(2)
        setError(t('checkout.errorBranch'))
        return false
      }
    }
    if (location.deliveryMethod === 'courier' && !location.address.trim()) {
      setErrorStep(2)
      setError(t('checkout.errorAddress'))
      return false
    }
    setErrorStep(null)
    setError(null)
    return true
  }

  const handleContactContinue = (e: FormEvent) => {
    e.preventDefault()
    if (!validateContact()) return
    const next: CheckoutContact = {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      phone: normalizeLocalPhone(contact.phone),
      email: contact.email.trim(),
    }
    setContact(next)
    saveContact(profileKey, next)
    setContactDone(true)
  }

  const handleLocationContinue = (e: FormEvent) => {
    e.preventDefault()
    if (!validateLocation()) return
    const next: CheckoutLocation = {
      deliveryMethod: location.deliveryMethod,
      city: location.city.trim(),
      cityRef: location.cityRef,
      branch: location.branch.trim(),
      warehouseRef: location.warehouseRef,
      address: location.address.trim(),
    }
    setLocation(next)
    saveLocation(profileKey, next)
    setLocationDone(true)
  }

  const setDeliveryMethod = (method: DeliveryMethod) => {
    setLocation((prev) => ({
      ...prev,
      deliveryMethod: method,
      branch: method === 'courier' ? '' : prev.branch,
      warehouseRef: method === 'courier' ? undefined : prev.warehouseRef,
      address: method === 'nova_poshta' ? (prev.warehouseRef ? prev.address : '') : prev.address,
    }))
  }

  const handleCityChange = (value: string) => {
    setLocation((prev) => ({
      ...prev,
      city: value,
      cityRef: undefined,
      branch: '',
      warehouseRef: undefined,
      address: prev.deliveryMethod === 'nova_poshta' ? '' : prev.address,
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
      address: prev.deliveryMethod === 'nova_poshta' ? '' : prev.address,
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
    saveLocation(profileKey, {
      deliveryMethod: location.deliveryMethod,
      city: location.city.trim(),
      cityRef: location.cityRef,
      branch: location.branch.trim(),
      warehouseRef: location.warehouseRef,
      address: location.address.trim(),
    })

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
      await OrdersApi.create({
        paymentMethod,
        deliveryMethod: location.deliveryMethod,
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

  const paymentOptions: {
    id: PaymentMethod
    title: string
    hint?: string
    icon: ReactNode
  }[] = [
    {
      id: 'pickup',
      title: t('checkout.paymentPickup'),
      hint: t('checkout.paymentPickupHint'),
      icon: <Wallet size={20} />,
    },
    {
      id: 'google_pay',
      title: t('checkout.paymentGoogle'),
      icon: <GooglePayIcon />,
    },
    {
      id: 'apple_pay',
      title: t('checkout.paymentApple'),
      icon: <ApplePayIcon />,
    },
  ]

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
              <form className={styles.formGrid} onSubmit={handleContactContinue}>
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
                <div className={styles.fullWidth}>
                  <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                    {t('checkout.continue')}
                  </Button>
                </div>
              </form>
            </CheckoutBlock>

            <CheckoutBlock
              step={2}
              title={t('checkout.stepLocation')}
              expanded={expandedSteps[2]}
              done={locationDone}
              summary={locationSummary}
              onToggle={() => toggleStep(2)}
            >
              <form onSubmit={handleLocationContinue}>
                <p className={styles.optionTitle} style={{ marginBottom: 8 }}>
                  {t('checkout.deliveryMethod')}
                </p>
                <div className={styles.optionList}>
                  <button
                    type="button"
                    className={[
                      styles.optionCard,
                      location.deliveryMethod === 'nova_poshta' ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setDeliveryMethod('nova_poshta')}
                  >
                    <span className={styles.radio}>
                      {location.deliveryMethod === 'nova_poshta' && <span className={styles.dot} />}
                    </span>
                    <span className={styles.optionIcon}>
                      <MapPin size={20} />
                    </span>
                    <span className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t('checkout.novaPoshta')}</span>
                      <span className={styles.optionHint}>{t('checkout.novaPoshtaHint')}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={[
                      styles.optionCard,
                      location.deliveryMethod === 'courier' ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setDeliveryMethod('courier')}
                  >
                    <span className={styles.radio}>
                      {location.deliveryMethod === 'courier' && <span className={styles.dot} />}
                    </span>
                    <span className={styles.optionIcon}>
                      <Truck size={20} />
                    </span>
                    <span className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t('checkout.courier')}</span>
                      <span className={styles.optionHint}>{t('checkout.courierHint')}</span>
                    </span>
                  </button>
                </div>

                <div className={styles.formGrid} style={{ marginTop: 16 }}>
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
                  {location.deliveryMethod === 'nova_poshta' ? (
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
                  ) : (
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
                  )}
                </div>

                {error && errorStep === 2 && <p className={styles.error}>{error}</p>}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight size={18} />}
                  style={{ marginTop: 16 }}
                >
                  {t('checkout.continue')}
                </Button>
              </form>
            </CheckoutBlock>

            <CheckoutBlock
              step={3}
              title={t('checkout.stepPayment')}
              expanded={expandedSteps[3]}
              done={Boolean(paymentMethod)}
              onToggle={() => toggleStep(3)}
            >
              <div className={styles.optionList}>
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      styles.optionCard,
                      paymentMethod === option.id ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setPaymentMethod(option.id)
                      setError(null)
                      setErrorStep(null)
                    }}
                  >
                    <span className={styles.radio}>
                      {paymentMethod === option.id && <span className={styles.dot} />}
                    </span>
                    <span className={styles.optionIcon}>{option.icon}</span>
                    <span className={styles.optionContent}>
                      <span className={styles.optionTitle}>{option.title}</span>
                      {option.hint && <span className={styles.optionHint}>{option.hint}</span>}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.commentToggle}
                onClick={() => setCommentOpen((v) => !v)}
                aria-expanded={commentOpen}
              >
                {t('checkout.comment')}
                {commentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {commentOpen && (
                <div className={styles.commentField}>
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('checkout.commentPlaceholder')}
                  />
                </div>
              )}

              {error && errorStep === 3 && <p className={styles.error}>{error}</p>}
            </CheckoutBlock>
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>
            <div className={styles.summaryRow}>
              <span>{t('cart.itemsLabel')}</span>
              <span>{t('cart.itemsCount', { count })}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t('cart.delivery')}</span>
              <span>{t('cart.deliveryNote')}</span>
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
