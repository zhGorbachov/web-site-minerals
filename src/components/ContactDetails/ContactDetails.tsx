import { Phone } from 'lucide-react'
import { PHONE_CONTACTS } from '@/config/ContactInfo'
import { SocialLinks } from './SocialLinks'
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
      <SocialLinks variant="menu" onLinkClick={onLinkClick} />
    </div>
  )
}

export { MESSENGER_ICON_MAP, ViberIcon, TelegramIcon, WhatsAppIcon, InstagramIcon } from './MessengerIcons'
