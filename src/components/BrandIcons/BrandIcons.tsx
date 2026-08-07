import novaPoshtaIcon from '@/assets/icons/NovaPoshta.png'
import ukrposhtaIcon from '@/assets/icons/Ukrposhta.png'
import bankTransferIcon from '@/assets/icons/BankTransfer.png'
import cashOnDeliveryIcon from '@/assets/icons/CashOnDelivery.png'
import selfPickupIcon from '@/assets/icons/SelfPickup.png'
import styles from './BrandIcons.module.scss'

type IconProps = {
  className?: string
}

function BrandImage({
  src,
  className,
  imgClassName,
}: {
  src: string
  className?: string
  imgClassName?: string
}) {
  return (
    <span className={className}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={imgClassName ?? styles.brandImg}
        draggable={false}
      />
    </span>
  )
}

export function NovaPoshtaIcon({ className }: IconProps) {
  return (
    <BrandImage
      src={novaPoshtaIcon}
      className={[styles.square, className].filter(Boolean).join(' ')}
    />
  )
}

export function UkrposhtaIcon({ className }: IconProps) {
  return (
    <BrandImage
      src={ukrposhtaIcon}
      className={[styles.square, className].filter(Boolean).join(' ')}
    />
  )
}

export function BankTransferIcon({ className }: IconProps) {
  return (
    <BrandImage
      src={bankTransferIcon}
      className={[styles.illustration, className].filter(Boolean).join(' ')}
    />
  )
}

export function CashOnDeliveryIcon({ className }: IconProps) {
  return (
    <BrandImage
      src={cashOnDeliveryIcon}
      className={[styles.illustration, className].filter(Boolean).join(' ')}
    />
  )
}

export function SelfPickupIcon({ className }: IconProps) {
  return (
    <BrandImage
      src={selfPickupIcon}
      className={[styles.illustration, className].filter(Boolean).join(' ')}
    />
  )
}

export const BRAND_ICON_SRC = {
  novaPoshta: novaPoshtaIcon,
  ukrposhta: ukrposhtaIcon,
  bankTransfer: bankTransferIcon,
  cashOnDelivery: cashOnDeliveryIcon,
  selfPickup: selfPickupIcon,
} as const
