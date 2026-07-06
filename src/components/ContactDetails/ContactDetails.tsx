import { Phone } from 'lucide-react'
import { PHONE_CONTACTS, MESSENGER_CONTACTS } from '@/config/ContactInfo'
import { MESSENGER_ICON_MAP } from './MessengerIcons'
import styles from './ContactDetails.module.scss'

interface ContactDetailsProps {
  variant?: 'menu' | 'page'
  onLinkClick?: () => void
}

export function ContactDetails({ variant = 'page', onLinkClick }: ContactDetailsProps) {
  if (variant === 'page') return null

  return (
    <div className={styles.menu}>
      <ul className={styles.phones}>
        {PHONE_CONTACTS.map((phone) => (
          <li key={phone.href}>
            <a href={phone.href} className={styles.phoneLink} onClick={onLinkClick}>
              <Phone size={14} aria-hidden="true" />
              {phone.display}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.socialRow}>
        {MESSENGER_CONTACTS.map((contact) => {
          const Icon = MESSENGER_ICON_MAP[contact.id]
          return (
            <a
              key={contact.id}
              href={contact.href}
              className={styles.messengerIconBtn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={contact.label}
              onClick={onLinkClick}
            >
              <Icon className={styles.messengerSvg} />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export { MESSENGER_ICON_MAP, ViberIcon, TelegramIcon, WhatsAppIcon, InstagramIcon } from './MessengerIcons'
