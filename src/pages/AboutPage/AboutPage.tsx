import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import {
  Heart,
  Truck,
  RefreshCw,
  Percent,
  HelpCircle,
  Star,
  Leaf,
  Sparkles,
  BadgeCheck,
  ArrowUpDown,
  Check,
  type LucideIcon,
} from 'lucide-react'
import type { StoreReview, StoreReviewSort } from '@/types'
import { ReviewsApi } from '@/api'
import { Breadcrumbs, Button, Loader } from '@/components/ui'
import {
  NovaPoshtaIcon,
  UkrposhtaIcon,
  SelfPickupIcon,
  CashOnDeliveryIcon,
} from '@/components/BrandIcons'
import { mockImages } from '@/assets/mock/Images'
import { scrollToHashTarget } from '@/utils/hashNav'
import { useTranslation } from '@/i18n/useTranslation'
import { translations } from '@/i18n/Translations'
import { useAuthStore } from '@/store'
import { useLanguageStore } from '@/store/languageStore'
import styles from './AboutPage.module.scss'

const GUEST_REVIEW_DONE_KEY = 'crystal-guest-review-done'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

type DeliveryIcon =
  | { type: 'brand'; node: ReactNode }
  | { type: 'lucide'; icon: LucideIcon; tone: string }

const DELIVERY_ICONS: DeliveryIcon[] = [
  { type: 'brand', node: <NovaPoshtaIcon className={styles.brandIcon} /> },
  { type: 'brand', node: <UkrposhtaIcon className={styles.brandIcon} /> },
  { type: 'brand', node: <SelfPickupIcon className={styles.brandIcon} /> },
  { type: 'brand', node: <CashOnDeliveryIcon className={styles.brandIcon} /> },
]

/** Icons matched to value titles: natural / quality / uniqueness / reliability. */
const VALUE_ICONS: { icon: LucideIcon; tone: string }[] = [
  { icon: Leaf, tone: styles.toneGreen },
  { icon: BadgeCheck, tone: styles.toneBlue },
  { icon: Sparkles, tone: styles.toneRose },
  { icon: Truck, tone: styles.toneTeal },
]

const SECTION_ICONS = {
  delivery: { icon: Truck, tone: styles.toneBlue },
  returns: { icon: RefreshCw, tone: styles.toneAmber },
  discounts: { icon: Percent, tone: styles.toneGreen },
  reviews: { icon: Star, tone: styles.toneAmber },
  values: { icon: Heart, tone: styles.toneRose },
  faq: { icon: HelpCircle, tone: styles.toneIndigo },
} as const

const REVIEW_SORT_OPTIONS: StoreReviewSort[] = ['date', 'rating']

export function AboutPage() {
  const location = useLocation()
  const { t, language } = useTranslation()
  const languageStore = useLanguageStore((state) => state.language)
  const user = useAuthStore((s) => s.user)
  const about = translations[languageStore].about

  const [reviews, setReviews] = useState<StoreReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [sort, setSort] = useState<StoreReviewSort>('date')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const [guestRating, setGuestRating] = useState(5)
  const [guestText, setGuestText] = useState('')
  const [guestSubmitting, setGuestSubmitting] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)
  const [guestDone, setGuestDone] = useState(() => {
    try {
      return localStorage.getItem(GUEST_REVIEW_DONE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!sortOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sortOpen])

  useEffect(() => {
    if (location.pathname !== '/about') return

    const timer = window.setTimeout(() => {
      scrollToHashTarget(location.hash)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash, reviewsLoading, guestDone])

  useEffect(() => {
    let cancelled = false
    setReviewsLoading(true)
    void ReviewsApi.list({ limit: 5, sort })
      .then((items) => {
        if (!cancelled) setReviews(items)
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sort])

  const sortLabel = sort === 'rating' ? t('storeReviews.sortByRating') : t('storeReviews.sortByDate')

  const reviewAuthorLabel = (review: StoreReview) =>
    review.userId ? review.author : t('storeReviews.anonymousAuthor')

  const handleGuestReviewSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setGuestError(null)
    setGuestSubmitting(true)
    try {
      const review = await ReviewsApi.create({
        rating: guestRating,
        text: guestText,
        language: language === 'en' ? 'en' : 'uk',
      })
      try {
        localStorage.setItem(GUEST_REVIEW_DONE_KEY, '1')
      } catch {
        /* ignore */
      }
      setGuestDone(true)
      setGuestText('')
      setReviews((prev) => [review, ...prev].slice(0, 5))
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.error === 'invalid_payload') {
        setGuestError(t('profile.reviewPlaceholder'))
      } else {
        setGuestError(t('profile.reviewError'))
      }
    } finally {
      setGuestSubmitting(false)
    }
  }
  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: t('about.breadcrumbHome'), href: '/' }, { label: t('about.breadcrumbAbout') }]} />

        <motion.section {...fadeIn} className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>{t('about.eyebrow')}</span>
            <h1 className={styles.heroTitle}>{t('about.heroTitle')}</h1>
            <div className={styles.heroDesc}>
              {about.heroParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src={mockImages.aboutStore} alt={t('about.storeAlt')} />
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="delivery">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.delivery.tone].join(' ')}>
              <SECTION_ICONS.delivery.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('about.deliveryTitle')}</h2>
          </div>
          <div className={styles.infoGrid}>
            {about.deliveryItems.map((item, index) => {
              const entry = DELIVERY_ICONS[index] ?? DELIVERY_ICONS[0]
              return (
                <div key={item.title} className={styles.infoCard}>
                  <div className={styles.infoCardHeader}>
                    {entry.type === 'brand' ? (
                      <div className={styles.infoCardIconBrand}>{entry.node}</div>
                    ) : (
                      <div className={[styles.infoCardIcon, entry.tone].join(' ')}>
                        <entry.icon size={22} />
                      </div>
                    )}
                    <h4 className={styles.infoCardTitle}>{item.title}</h4>
                  </div>
                  <p className={styles.infoCardText}>{item.text}</p>
                </div>
              )
            })}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="returns">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.returns.tone].join(' ')}>
              <SECTION_ICONS.returns.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('about.returnsTitle')}</h2>
          </div>
          <div className={styles.textContent}>
            <p>{t('about.returnsIntro')}</p>
            <p>{t('about.returnsConditionsTitle')}</p>
            <ul className={styles.contentList}>
              {about.returnsConditions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{t('about.returnsContact')}</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="discounts">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.discounts.tone].join(' ')}>
              <SECTION_ICONS.discounts.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('about.discountsTitle')}</h2>
          </div>
          <div className={styles.textContent}>
            <p>{t('about.discountsIntro')}</p>
            <ul className={styles.contentList}>
              {about.discountsTiers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{t('about.discountsFreeDelivery')}</p>
            <p>{t('about.discountsPersonal')}</p>
            <p>{t('about.discountsStrands')}</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="reviews">
          <div className={styles.reviewsHeader}>
            <div className={styles.sectionHeader}>
              <div className={[styles.sectionIconWrap, SECTION_ICONS.reviews.tone].join(' ')}>
                <SECTION_ICONS.reviews.icon size={22} />
              </div>
              <h2 className={styles.sectionTitle}>{t('about.reviewsTitle')}</h2>
            </div>

            <div className={styles.reviewSort} ref={sortRef}>
              <button
                type="button"
                className={[styles.reviewSortTrigger, sortOpen ? styles.reviewSortTriggerActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSortOpen((open) => !open)}
                aria-label={t('storeReviews.sortAria')}
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
              >
                <ArrowUpDown size={16} aria-hidden />
                <span>{sortLabel}</span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.ul
                    className={styles.reviewSortMenu}
                    role="listbox"
                    aria-label={t('storeReviews.sortAria')}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {REVIEW_SORT_OPTIONS.map((option) => {
                      const active = option === sort
                      const label =
                        option === 'rating' ? t('storeReviews.sortByRating') : t('storeReviews.sortByDate')
                      return (
                        <li key={option} role="option" aria-selected={active}>
                          <button
                            type="button"
                            className={[styles.reviewSortOption, active ? styles.reviewSortOptionActive : '']
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              setSort(option)
                              setSortOpen(false)
                            }}
                          >
                            <span>{label}</span>
                            {active && <Check size={14} aria-hidden />}
                          </button>
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {reviewsLoading ? (
            <Loader />
          ) : reviews.length === 0 ? (
            <p className={styles.reviewsEmpty}>{t('storeReviews.empty')}</p>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <article key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewStars} aria-label={t('about.reviewRating', { rating: review.rating })}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                        className={i < review.rating ? undefined : styles.reviewStarEmpty}
                      />
                    ))}
                  </div>
                  <p className={styles.reviewText}>{review.text}</p>
                  <div className={styles.reviewMeta}>
                    <p className={styles.reviewAuthor}>{reviewAuthorLabel(review)}</p>
                    <time className={styles.reviewDate} dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US')}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="leave-review">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.reviews.tone].join(' ')}>
              <SECTION_ICONS.reviews.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('storeReviews.guestFormTitle')}</h2>
          </div>

          {user ? (
            <div className={styles.leaveReviewBox}>
              <p className={styles.leaveReviewHint}>{t('profile.reviewHint')}</p>
              <Button as={Link} to="/profile#review">
                {t('storeReviews.leaveReview')}
              </Button>
            </div>
          ) : guestDone ? (
            <p className={styles.leaveReviewSuccess}>{t('storeReviews.guestSuccess')}</p>
          ) : (
            <form className={styles.leaveReviewForm} onSubmit={handleGuestReviewSubmit}>
              <p className={styles.leaveReviewHint}>{t('storeReviews.guestHint')}</p>
              <fieldset className={styles.ratingField}>
                <legend className={styles.ratingLabel}>{t('profile.reviewRatingLabel')}</legend>
                <div className={styles.ratingStars}>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1
                    const active = value <= guestRating
                    return (
                      <button
                        key={value}
                        type="button"
                        className={[styles.ratingStarBtn, active ? styles.ratingStarBtnActive : '']
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setGuestRating(value)}
                        aria-label={t('about.reviewRating', { rating: value })}
                      >
                        <Star size={22} fill={active ? 'currentColor' : 'none'} />
                      </button>
                    )
                  })}
                </div>
              </fieldset>
              <label className={styles.reviewTextLabel}>
                <span className={styles.srOnly}>{t('storeReviews.guestFormTitle')}</span>
                <textarea
                  className={styles.reviewTextarea}
                  value={guestText}
                  onChange={(e) => setGuestText(e.target.value)}
                  placeholder={t('profile.reviewPlaceholder')}
                  rows={4}
                  maxLength={1000}
                  required
                  minLength={10}
                />
              </label>
              {guestError && <p className={styles.leaveReviewError}>{guestError}</p>}
              <Button type="submit" disabled={guestSubmitting || guestText.trim().length < 10}>
                {t('profile.reviewSubmit')}
              </Button>
            </form>
          )}
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="values">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.values.tone].join(' ')}>
              <SECTION_ICONS.values.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('about.valuesTitle')}</h2>
          </div>
          <div className={styles.valuesGrid}>
            {about.values.map((value, index) => {
              const { icon: Icon, tone } = VALUE_ICONS[index] ?? VALUE_ICONS[0]
              return (
                <div key={value.title} className={styles.valueCard}>
                  <div className={styles.valueCardHeader}>
                    <div className={[styles.valueIcon, tone].join(' ')}>
                      <Icon size={20} />
                    </div>
                    <h4 className={styles.valueTitle}>{value.title}</h4>
                  </div>
                  <p className={styles.valueText}>{value.text}</p>
                </div>
              )
            })}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="faq">
          <div className={styles.sectionHeader}>
            <div className={[styles.sectionIconWrap, SECTION_ICONS.faq.tone].join(' ')}>
              <SECTION_ICONS.faq.icon size={22} />
            </div>
            <h2 className={styles.sectionTitle}>{t('about.faqTitle')}</h2>
          </div>
          <div className={styles.faqList}>
            {about.faq.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{item.q}</summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
