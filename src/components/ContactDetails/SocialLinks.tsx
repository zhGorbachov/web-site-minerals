import { SOCIAL_ICON_CONTACTS, INSTAGRAM_CONTACTS } from '@/config/ContactInfo'
import { MESSENGER_ICON_MAP } from './MessengerIcons'
import styles from './SocialLinks.module.scss'

interface SocialLinksProps {
  variant?: 'menu' | 'footer'
  onLinkClick?: () => void
}

export function SocialLinks({ variant = 'menu', onLinkClick }: SocialLinksProps) {
  return (
    <div className={[styles.socialLinks, styles[variant]].filter(Boolean).join(' ')}>
      <div className={styles.chatRow}>
        {SOCIAL_ICON_CONTACTS.map((contact) => {
          const Icon = MESSENGER_ICON_MAP[contact.id]
          return (
            <a
              key={contact.id}
              href={contact.href}
              className={styles.chatIconBtn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={contact.label}
              title={contact.label}
              onClick={onLinkClick}
            >
              <Icon className={styles.chatIcon} />
            </a>
          )
        })}
      </div>

      {INSTAGRAM_CONTACTS.map((contact) => {
        const Icon = MESSENGER_ICON_MAP[contact.id]
        return (
          <a
            key={contact.id}
            href={contact.href}
            className={styles.instagramRow}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={contact.label}
            onClick={onLinkClick}
          >
            <span className={styles.instagramIconWrap}>
              <Icon className={styles.instagramIcon} />
            </span>
            <span className={styles.instagramLabel}>{contact.label}</span>
          </a>
        )
      })}
    </div>
  )
}
