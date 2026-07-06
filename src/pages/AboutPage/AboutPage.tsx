import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gem, Heart, Truck, RefreshCw, Percent, HelpCircle, Shield, Star } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui'
import { mockImages } from '@/assets/mock/Images'
import { scrollToHashTarget } from '@/utils/hashNav'
import { useTranslation } from '@/i18n/useTranslation'
import { translations } from '@/i18n/Translations'
import { useLanguageStore } from '@/store/languageStore'
import { SITE_NAME } from '@/config/Site'
import styles from './AboutPage.module.scss'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

const VALUE_ICONS = [Gem, Heart, Shield, Truck]

export function AboutPage() {
  const location = useLocation()
  const { t } = useTranslation()
  const language = useLanguageStore((state) => state.language)
  const about = translations[language].about

  useEffect(() => {
    if (location.pathname !== '/about') return

    const timer = window.setTimeout(() => {
      scrollToHashTarget(location.hash)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: t('about.breadcrumbHome'), href: '/' }, { label: t('about.breadcrumbAbout') }]} />

        <motion.section {...fadeIn} className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>{t('about.eyebrow')}</span>
            <h1 className={styles.heroTitle}>{t('about.heroTitle')}</h1>
            <p className={styles.heroDesc}>{t('about.heroDesc', { siteName: SITE_NAME })}</p>
          </div>
          <div className={styles.heroImage}>
            <img src={mockImages.aboutStore} alt={t('about.storeAlt')} />
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="delivery">
          <div className={styles.sectionHeader}>
            <Truck className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t('about.deliveryTitle')}</h2>
          </div>
          <div className={styles.infoGrid}>
            {about.deliveryItems.map((item) => (
              <div key={item.title} className={styles.infoCard}>
                <h4 className={styles.infoCardTitle}>{item.title}</h4>
                <p className={styles.infoCardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="returns">
          <div className={styles.sectionHeader}>
            <RefreshCw className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t('about.returnsTitle')}</h2>
          </div>
          <div className={styles.textContent}>
            <p>{t('about.returnsP1')}</p>
            <p>{t('about.returnsP2')}</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={[styles.section, styles.sectionGray].join(' ')} id="discounts">
          <div className={styles.sectionHeader}>
            <Percent className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t('about.discountsTitle')}</h2>
          </div>
          <div className={styles.textContent}>
            <p>{t('about.discountsP1')}</p>
            <p>{t('about.discountsP2')}</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="reviews">
          <div className={styles.sectionHeader}>
            <Star className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t('about.reviewsTitle')}</h2>
          </div>
          <div className={styles.reviewsList}>
            {about.reviews.map((review) => (
              <article key={review.author} className={styles.reviewCard}>
                <div className={styles.reviewStars} aria-label={t('about.reviewRating', { rating: review.rating })}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <p className={styles.reviewAuthor}>{review.author}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="values">
          <div className={styles.sectionHeader}>
            <Heart className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t('about.valuesTitle')}</h2>
          </div>
          <div className={styles.valuesGrid}>
            {about.values.map((value, index) => {
              const Icon = VALUE_ICONS[index] ?? Gem
              return (
                <div key={value.title} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <Icon size={24} />
                  </div>
                  <h4 className={styles.valueTitle}>{value.title}</h4>
                  <p className={styles.valueText}>{value.text}</p>
                </div>
              )
            })}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className={styles.section} id="faq">
          <div className={styles.sectionHeader}>
            <HelpCircle className={styles.sectionIcon} />
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
