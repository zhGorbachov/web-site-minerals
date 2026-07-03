import { Phone } from 'lucide-react'
import { PHONE_CONTACTS } from '@/config/ContactInfo'
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
          <li key={phone.href} className={phone.messengers?.length ? styles.phoneWithMessengers : undefined}>
            <a href={phone.href} className={styles.phoneLink} onClick={onLinkClick}>
              <Phone size={14} aria-hidden="true" />
              {phone.display}
            </a>
            {phone.messengers?.length && (
              <div className={styles.messengers}>
                {phone.messengers.map((messenger) => {
                  const Icon = MESSENGER_ICON_MAP[messenger.id]
                  return (
                    <a
                      key={messenger.id}
                      href={messenger.href}
                      className={styles.messengerIconBtn}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={messenger.label}
                      onClick={onLinkClick}
                    >
                      <Icon className={styles.messengerSvg} />
                    </a>
                  )
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { MESSENGER_ICON_MAP, ViberIcon, TelegramIcon, WhatsAppIcon } from './MessengerIcons'
