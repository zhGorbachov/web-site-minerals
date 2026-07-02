import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Send, Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui'
import styles from './ContactsPage.module.scss'

export function ContactsPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Контакти' }]} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={styles.header}
        >
          <h1 className={styles.title}>Контакти</h1>
          <p className={styles.subtitle}>Будемо раді відповісти на всі ваші питання</p>
        </motion.div>

        <div className={styles.layout}>
          <div className={styles.contactCards}>
            {CONTACTS.map((item, i) => (
              <motion.div
                key={item.title}
                className={styles.contactCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className={styles.contactIcon}>{item.icon}</div>
                <div className={styles.contactBody}>
                  <h4 className={styles.contactTitle}>{item.title}</h4>
                  {item.href ? (
                    <a href={item.href} className={styles.contactValue} target={item.external ? '_blank' : undefined} rel="noopener noreferrer">
                      {item.value}
                    </a>
                  ) : (
                    <span className={styles.contactValue}>{item.value}</span>
                  )}
                  {item.note && <p className={styles.contactNote}>{item.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={styles.mapPlaceholder}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.mapInner}>
              <MapPin size={40} className={styles.mapIcon} />
              <p className={styles.mapText}>Інтерактивна карта — незабаром</p>
              <p className={styles.mapSubText}>Україна, доставляємо по всій країні</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const CONTACTS = [
  {
    icon: <Phone size={24} />,
    title: 'Телефон',
    value: '+38 (099) 123-45-67',
    href: 'tel:+380991234567',
    note: 'Пн–Пт: 9:00 – 19:00',
  },
  {
    icon: <Mail size={24} />,
    title: 'Email',
    value: 'hello@crystal.ua',
    href: 'mailto:hello@crystal.ua',
    note: 'Відповідаємо протягом 24 годин',
  },
  {
    icon: <Send size={24} />,
    title: 'Telegram',
    value: '@crystal_store',
    href: 'https://t.me/crystal_store',
    external: true,
    note: 'Найшвидший спосіб зв\'язку',
  },
  {
    icon: <Clock size={24} />,
    title: 'Графік роботи',
    value: 'Пн–Пт: 9:00 – 19:00',
    href: undefined,
    note: 'Сб: 10:00 – 16:00 | Нд: вихідний',
  },
]
