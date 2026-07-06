import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui'
import { MESSENGER_ICON_MAP } from '@/components/ContactDetails'
import { PHONE_CONTACTS, INSTAGRAM_CONTACTS } from '@/config/ContactInfo'
import { scrollToHashTarget } from '@/utils/hashNav'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './ContactsPage.module.scss'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function ContactsPage() {
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    if (location.pathname !== '/contacts') return

    const timer = window.setTimeout(() => {
      scrollToHashTarget(location.hash)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])

  let cardIndex = 0

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: t('about.breadcrumbHome'), href: '/' }, { label: t('nav.contacts') }]} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={styles.header}
        >
          <h1 className={styles.title}>{t('nav.contacts')}</h1>
          <p className={styles.subtitle}>{t('contacts.subtitle')}</p>
        </motion.div>

        <div className={styles.layout}>
          <div className={styles.contactCards}>
            {PHONE_CONTACTS.map((phone) => {
              const delay = cardIndex++ * 0.08
              if (phone.messengers?.length) {
                return (
                  <motion.div
                    key={phone.href}
                    className={[styles.contactCard, styles.phoneGroupCard].join(' ')}
                    {...fadeUp}
                    transition={{ duration: 0.3, delay }}
                  >
                    <div className={styles.phoneGroupHeader}>
                      <div className={styles.contactIcon}>
                        <Phone size={24} />
                      </div>
                      <div className={styles.contactBody}>
                        <h4 className={styles.contactTitle}>{t('contacts.phoneTitle')}</h4>
                        <a href={phone.href} className={styles.contactValue}>
                          {phone.display}
                        </a>
                      </div>
                    </div>
                    <div className={styles.messengerSubTiles}>
                      {phone.messengers.map((messenger) => {
                        const Icon = MESSENGER_ICON_MAP[messenger.id]
                        return (
                          <a
                            key={messenger.id}
                            href={messenger.href}
                            className={styles.messengerSubTile}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={messenger.label}
                          >
                            <div className={styles.messengerSubIcon}>
                              <Icon />
                            </div>
                            <span className={styles.messengerSubLabel}>{messenger.label}</span>
                          </a>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              }
              return (
                <motion.div
                  key={phone.href}
                  className={styles.contactCard}
                  {...fadeUp}
                  transition={{ duration: 0.3, delay }}
                >
                  <div className={styles.contactIcon}>
                    <Phone size={24} />
                  </div>
                  <div className={styles.contactBody}>
                    <h4 className={styles.contactTitle}>{t('contacts.phoneTitle')}</h4>
                    <a href={phone.href} className={styles.contactValue}>
                      {phone.display}
                    </a>
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              className={[styles.contactCard, styles.phoneGroupCard].join(' ')}
              {...fadeUp}
              transition={{ duration: 0.3, delay: cardIndex++ * 0.08 }}
            >
              <div className={styles.phoneGroupHeader}>
                <div className={[styles.contactIcon, styles.instagramGroupIcon].join(' ')}>
                  <MESSENGER_ICON_MAP.instagram_stones />
                </div>
                <div className={styles.contactBody}>
                  <h4 className={styles.contactTitle}>{t('contacts.instagramTitle')}</h4>
                  <p className={styles.contactNote}>{t('contacts.instagramNote')}</p>
                </div>
              </div>
              <div className={styles.messengerSubTiles}>
                {INSTAGRAM_CONTACTS.map((instagram) => (
                  <a
                    key={instagram.id}
                    href={instagram.href}
                    className={styles.textSubTile}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={instagram.label}
                  >
                    <span className={styles.messengerSubLabel}>{instagram.label}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {OTHER_CONTACTS.map((item) => {
              const delay = cardIndex++ * 0.08
              return (
                <motion.div
                  key={item.titleKey}
                  className={styles.contactCard}
                  {...fadeUp}
                  transition={{ duration: 0.3, delay }}
                >
                  <div className={styles.contactIcon}>{item.icon}</div>
                  <div className={styles.contactBody}>
                    <h4 className={styles.contactTitle}>{t(item.titleKey)}</h4>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={styles.contactValue}
                        target={item.external ? '_blank' : undefined}
                        rel="noopener noreferrer"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className={styles.contactValue}>
                        {item.valueKey ? t(item.valueKey) : item.value}
                      </span>
                    )}
                    {item.noteKey && <p className={styles.contactNote}>{t(item.noteKey)}</p>}
                  </div>
                </motion.div>
              )
            })}

            <motion.section
              className={styles.scheduleSection}
              id="schedule"
              {...fadeUp}
              transition={{ duration: 0.3, delay: cardIndex * 0.08 }}
            >
              <p className={styles.scheduleSectionLabel}>{t('contacts.scheduleSectionLabel')}</p>
              <div className={styles.scheduleCard}>
                <div className={styles.scheduleIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.contactBody}>
                  <h4 className={styles.scheduleTitle}>{t('contacts.scheduleTitle')}</h4>
                  <p className={styles.scheduleValue}>{t('contacts.scheduleValue')}</p>
                  <p className={styles.scheduleNote}>{t('contacts.scheduleNote')}</p>
                </div>
              </div>
            </motion.section>
          </div>

          <motion.div
            className={styles.mapPlaceholder}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.mapInner}>
              <MapPin size={40} className={styles.mapIcon} />
              <p className={styles.mapText}>{t('contacts.mapSoon')}</p>
              <p className={styles.mapSubText}>{t('contacts.mapSubtext')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const OTHER_CONTACTS = [
  {
    icon: <Mail size={24} />,
    titleKey: 'contacts.emailTitle' as const,
    value: 'hello@crystal.ua',
    href: 'mailto:hello@crystal.ua',
    noteKey: 'contacts.emailNote' as const,
  },
]
