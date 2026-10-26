import type { Language } from '@/i18n/Translations'
import { isBeadSelection } from './beadSale'
import { isHalfStrandSelection } from './strandPool'

/** Strand products are sold whole or half; the half option's label says so ("Пів низки…" / "Half strand…"). */
export function isHalfStrandItem(selectedOptions?: Record<string, string> | null): boolean {
  return isHalfStrandSelection(selectedOptions)
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

/** Unit suffix for the per-line price, e.g. "0,5 шт." for a half-strand line, "шт. (поштучно)" for loose beads. */
export function orderItemUnitLabel(
  item: { selectedOptions?: Record<string, string> | null },
  language: Language,
): string {
  const unitWord = language === 'uk' ? 'шт.' : 'pc.'
  if (isBeadSelection(item.selectedOptions)) {
    return `${unitWord} ${language === 'uk' ? '(поштучно)' : '(by the bead)'}`
  }
  if (!isHalfStrandItem(item.selectedOptions)) return unitWord
  return `${formatQuantityNumber(0.5, language)} ${unitWord}`
}
