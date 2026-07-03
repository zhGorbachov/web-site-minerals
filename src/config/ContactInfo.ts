export type MessengerContact = {
  id: 'viber' | 'telegram' | 'whatsapp'
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

// 099 is displayed first (standalone), 066 is grouped with messengers
export const PHONE_CONTACTS: PhoneContact[] = [
  { display: '+38 (099) 123-45-67', href: 'tel:+380991234567' },
  { display: '+38 (066) 834-43-22', href: 'tel:+380668344322', messengers: MESSENGER_066 },
]

// Flat list for footer / other uses
export const MESSENGER_CONTACTS: MessengerContact[] = MESSENGER_066

export const PRIMARY_PHONE = PHONE_CONTACTS[1] // 066 is the messenger-linked number
