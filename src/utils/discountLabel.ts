import type { TranslationKey } from '@/i18n/useTranslation'
import type { CartPricing } from './pricing'

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

export type CartSummaryLine = {
  id: string
  label: string
  amount: number
  tone: 'plain' | 'discount'
  /** Discount sits under the group sum it applies to. */
  nested: boolean
}

function discountLineLabel(
  isPersonal: boolean,
  percent: number,
  scope: 'single' | 'strands' | 'other',
  t: Translate,
): string {
  if (scope === 'strands') {
    return isPersonal
      ? t('cart.discountStrandsPersonalLine', { percent })
      : t('cart.discountStrandsVolumeLine', { percent })
  }
  if (scope === 'other') {
    return isPersonal
      ? t('cart.discountOtherPersonalLine', { percent })
      : t('cart.discountOtherVolumeLine', { percent })
  }
  return isPersonal
    ? t('cart.discountPersonalLine', { percent })
    : t('cart.discountVolumeLine', { percent })
}

/**
 * Rows between the item count and delivery.
 * One discount pool stays as Сума + one discount line.
 * Two pools (низки / інші товари / без знижки) are written out separately,
 * so each discount sits under the sum it was taken from.
 */
export function getCartSummaryLines(pricing: CartPricing, t: Translate): CartSummaryLine[] {
  if (pricing.discountAmount <= 0) return []

  const groups: Array<{
    id: string
    subtotal: number
    discountAmount: number
    percent: number
    isPersonal: boolean
    groupLabel: string
  }> = []

  if (pricing.strandsSubtotal > 0) {
    groups.push({
      id: 'strands',
      subtotal: pricing.strandsSubtotal,
      discountAmount: pricing.strandsDiscountAmount,
      percent: pricing.strandsDiscountPercent,
      isPersonal: pricing.strandsIsPersonal,
      groupLabel: t('cart.strandsGroup'),
    })
  }
  if (pricing.otherSubtotal > 0) {
    groups.push({
      id: 'other',
      subtotal: pricing.otherSubtotal,
      discountAmount: pricing.otherDiscountAmount,
      percent: pricing.otherDiscountPercent,
      isPersonal: pricing.otherIsPersonal,
      groupLabel: t('cart.otherGroup'),
    })
  }

  const excludedActive = pricing.excludedSubtotal > 0
  const split = groups.length + (excludedActive ? 1 : 0) > 1
  const lines: CartSummaryLine[] = []

  if (!split) {
    const group = groups[0]
    if (!group) return []
    lines.push({
      id: 'subtotal',
      label: t('cart.subtotal'),
      amount: group.subtotal,
      tone: 'plain',
      nested: false,
    })
    lines.push({
      id: 'discount',
      label: discountLineLabel(
        group.isPersonal,
        group.percent,
        group.id === 'strands' ? 'strands' : 'single',
        t,
      ),
      amount: group.discountAmount,
      tone: 'discount',
      nested: false,
    })
    return lines
  }

  for (const group of groups) {
    lines.push({
      id: `${group.id}-sum`,
      label: group.groupLabel,
      amount: group.subtotal,
      tone: 'plain',
      nested: false,
    })
    if (group.discountAmount > 0) {
      lines.push({
        id: `${group.id}-discount`,
        label: discountLineLabel(
          group.isPersonal,
          group.percent,
          group.id === 'strands' ? 'strands' : 'other',
          t,
        ),
        amount: group.discountAmount,
        tone: 'discount',
        nested: true,
      })
    }
  }

  if (excludedActive) {
    lines.push({
      id: 'excluded-sum',
      label: t('cart.excludedGroup'),
      amount: pricing.excludedSubtotal,
      tone: 'plain',
      nested: false,
    })
  }

  return lines
}

/** Short label for cart/checkout discount row. */
export function getDiscountLabel(pricing: CartPricing, t: Translate): string {
  if (pricing.discountAmount <= 0) return ''

  const hasOther = pricing.otherSubtotal > 0 && pricing.otherDiscountPercent > 0
  const hasStrands = pricing.strandsSubtotal > 0 && pricing.strandsDiscountPercent > 0

  if (hasOther && hasStrands && pricing.otherDiscountPercent !== pricing.strandsDiscountPercent) {
    return t('cart.discountMixed', {
      personal: pricing.otherDiscountPercent,
      strands: pricing.strandsDiscountPercent,
    })
  }

  const percent = hasOther ? pricing.otherDiscountPercent : pricing.strandsDiscountPercent
  const isPersonal = hasOther ? pricing.otherIsPersonal : pricing.strandsIsPersonal
  return isPersonal
    ? t('cart.discountPersonal', { percent })
    : t('cart.discountVolume', { percent })
}
