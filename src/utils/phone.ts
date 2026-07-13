export const UA_COUNTRY_PREFIX = '+38'

/** Strip country code; store/login with local UA number like 0671234567. */
export function normalizeLocalPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '')

  if (digits.startsWith('380')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('38') && digits.length > 9) {
    digits = digits.slice(2)
  }

  if (digits.length === 9 && !digits.startsWith('0')) {
    digits = `0${digits}`
  }

  return digits
}

/** Ukrainian mobile: 0 + 9 digits (e.g. 0671234567). */
export function isValidLocalPhone(phone: string): boolean {
  return /^0\d{9}$/.test(normalizeLocalPhone(phone))
}

export function formatPhoneDisplay(phone: string): string {
  const local = normalizeLocalPhone(phone)
  if (!local) return ''
  return `${UA_COUNTRY_PREFIX} ${local}`
}
