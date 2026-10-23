import type { Language } from '@/i18n/Translations'

const HALF_STRAND_PREFIX = 'Пів'

/** Strand products are sold whole or half; the half option's label always starts with "Пів". */
export function isHalfStrandItem(selectedOptions?: Record<string, string> | null): boolean {
  return Boolean(selectedOptions?.strandLength?.trim().startsWith(HALF_STRAND_PREFIX))
}

function formatQuantityNumber(value: number, language: Language): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return language === 'uk' ? text.replace('.', ',') : text
}

/**
 * A strand item's "quantity" counts lines sold, not strands bought — a half-strand line still has
 * quantity 1. Scale it down so order views show how much of a strand was actually purchased.
 */
export function formatOrderItemQuantity(
  item: { quantity: number; selectedOptions?: Record<string, string> | null },
  language: Language,
): string {
  const value = isHalfStrandItem(item.selectedOptions) ? item.quantity * 0.5 : item.quantity
  return formatQuantityNumber(value, language)
}

/** Unit suffix for the per-line price, e.g. "0,5 шт." for a half-strand line. */
export function orderItemUnitLabel(
  item: { selectedOptions?: Record<string, string> | null },
  language: Language,
): string {
  const unitWord = language === 'uk' ? 'шт.' : 'pc.'
  if (!isHalfStrandItem(item.selectedOptions)) return unitWord
  return `${formatQuantityNumber(0.5, language)} ${unitWord}`
}
