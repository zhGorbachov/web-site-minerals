import type { BraceletAttributes, MineralAttributes, Product, StrandLengthOption } from '@/types'

export const DEFAULT_WRIST_SIZES = Array.from({ length: 9 }, (_, i) => `${i + 14} см`)

/** Default buyer choice for every mineral strand: whole or half. */
export const DEFAULT_STRAND_LENGTHS: StrandLengthOption[] = [
  { label: 'Низка 39 см', value: '39 см' },
  { label: 'Пів низки 19.5 см', value: '19.5 см' },
]

export function isMineralStrandAttributes(attrs: MineralAttributes): boolean {
  return Boolean(
    attrs.strandLengths?.length ||
      attrs.beadSizes?.length ||
      attrs.beadCounts?.length ||
      attrs.shape === 'Низка',
  )
}

/**
 * Strand products always offer whole + half.
 * Custom `strandLengths` from admin win; otherwise defaults apply.
 */
export function getMineralStrandLengths(attrs: MineralAttributes): StrandLengthOption[] {
  if (attrs.strandLengths?.length) return attrs.strandLengths
  if (isMineralStrandAttributes(attrs)) return DEFAULT_STRAND_LENGTHS
  return []
}

export function productRequiresOptions(product: Product): boolean {
  if (product.categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    return Boolean(
      attrs.beadSizes?.length ||
        attrs.beadCounts?.length ||
        attrs.wristSizes?.length ||
        getMineralStrandLengths(attrs).length,
    )
  }
  // Threads always offer color; bracelets always offer wrist size.
  return product.categorySlug === 'nytky' || product.categorySlug === 'brаslety'
}

export function getBraceletWristSizes(attrs: BraceletAttributes): string[] {
  if (attrs.wristSizes?.length) return attrs.wristSizes
  return DEFAULT_WRIST_SIZES
}
