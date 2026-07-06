import viberIcon from '@/assets/icons/Viber.png'
import telegramIcon from '@/assets/icons/Telegram.png'
import whatsAppIcon from '@/assets/icons/WhatsApp.png'
import instagramIcon from '@/assets/icons/Instagram.png'
import styles from './MessengerIcons.module.scss'

type IconProps = {
  className?: string
}

function MessengerImage({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={className ?? styles.brandImg}
      draggable={false}
    />
  )
}

export function ViberIcon({ className }: IconProps) {
  return <MessengerImage src={viberIcon} className={className} />
}

export function TelegramIcon({ className }: IconProps) {
  return <MessengerImage src={telegramIcon} className={className} />
}

export function WhatsAppIcon({ className }: IconProps) {
  return <MessengerImage src={whatsAppIcon} className={className} />
}

export function InstagramIcon({ className }: IconProps) {
  return <MessengerImage src={instagramIcon} className={className} />
}

export const MESSENGER_ICON_MAP = {
  viber: ViberIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  instagram_stones: InstagramIcon,
  instagram_jewelry: InstagramIcon,
} as const

export const MESSENGER_ICON_SRC = {
  viber: viberIcon,
  telegram: telegramIcon,
  whatsapp: whatsAppIcon,
  instagram: instagramIcon,
} as const
