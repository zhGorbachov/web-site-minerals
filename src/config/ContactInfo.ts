export type MessengerContact = {
  id: 'viber' | 'telegram' | 'whatsapp' | 'instagram_stones' | 'instagram_jewelry'
  label: string
  href: string
}

export type PhoneContact = {
  display: string
  href: string
  messengers?: MessengerContact[]
}

const MESSENGER_066: MessengerContact[] = [
  { id: 'viber', label: 'Viber', href: 'viber://chat?number=380668344322' },
  { id: 'telegram', label: 'Telegram', href: 'https://t.me/crystal_store' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/380668344322' },
]

export const SOCIAL_ICON_CONTACTS: MessengerContact[] = MESSENGER_066

export const INSTAGRAM_CONTACTS: MessengerContact[] = [
  {
    id: 'instagram_stones',
    label: '@lux_.stones._',
    href: 'https://www.instagram.com/lux_.stones._?igsh=Zm9lOHllNDlzZzF0&utm_source=qr',
  },
  {
    id: 'instagram_jewelry',
    label: '@lux_.jewelry._',
    href: 'https://www.instagram.com/lux_.jewelry._?igsh=bjF3d2hheDJwZWN0&utm_source=qr',
  },
]

// 098 is displayed first (standalone), 066 is grouped with messengers
export const PHONE_CONTACTS: PhoneContact[] = [
  { display: '+38 (098) 813-31-46', href: 'tel:+380988133146' },
  { display: '+38 (066) 834-43-22', href: 'tel:+380668344322', messengers: MESSENGER_066 },
]

// Flat list for footer / other uses
export const MESSENGER_CONTACTS: MessengerContact[] = [...MESSENGER_066, ...INSTAGRAM_CONTACTS]

export const PRIMARY_PHONE = PHONE_CONTACTS[1] // 066 is the messenger-linked number
