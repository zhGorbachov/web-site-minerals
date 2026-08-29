import type {
  BraceletAttributes,
  IncenseAttributes,
  IncenseSaleMode,
  MineralAttributes,
  Product,
  StrandLengthOption,
  ThreadAttributes,
} from '@/types'
import { hasProductVariants } from './productVariants'
import {
  DEFAULT_BEAD_SIZES,
  DEFAULT_INCENSE_SALE_MODE,
  DEFAULT_PACK_WEIGHTS,
  DEFAULT_PIECE_WEIGHTS,
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
} from './catalogDefaults'

export {
  DEFAULT_BEAD_SIZES,
  DEFAULT_INCENSE_SALE_MODE,
  DEFAULT_PACK_WEIGHTS,
  DEFAULT_PIECE_WEIGHTS,
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
}

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

/** Низки: bead diameter is a price criterion, so the defaults are always offered. */
export function getThreadBeadSizes(attrs: ThreadAttributes): string[] {
  return attrs.beadSizes?.length ? attrs.beadSizes : DEFAULT_BEAD_SIZES
}

/** Низки: whole strand or half strand. */
export function getThreadStrandLengths(attrs: ThreadAttributes): StrandLengthOption[] {
  return attrs.strandLengths?.length ? attrs.strandLengths : DEFAULT_STRAND_LENGTHS
}

export function getBraceletWristSizes(attrs: BraceletAttributes): string[] {
  if (attrs.wristSizes?.length) return attrs.wristSizes
  return DEFAULT_WRIST_SIZES
}

export function getBraceletBeadSizes(attrs: BraceletAttributes): string[] {
  return attrs.beadSizes?.length ? attrs.beadSizes : DEFAULT_BEAD_SIZES
}

export function getIncenseSaleMode(attrs: IncenseAttributes): IncenseSaleMode {
  return attrs.saleMode === 'piece' ? 'piece' : DEFAULT_INCENSE_SALE_MODE
}

/** Option key the incense buyer selects, depending on the sale mode. */
export function getIncenseOptionKey(attrs: IncenseAttributes): 'packWeight' | 'pieceWeight' {
  return getIncenseSaleMode(attrs) === 'piece' ? 'pieceWeight' : 'packWeight'
}

export function getIncenseWeights(attrs: IncenseAttributes): string[] {
  if (getIncenseSaleMode(attrs) === 'piece') {
    return attrs.pieceWeights?.length ? attrs.pieceWeights : DEFAULT_PIECE_WEIGHTS
  }
  return attrs.packWeights?.length ? attrs.packWeights : DEFAULT_PACK_WEIGHTS
}

export function productRequiresOptions(product: Product): boolean {
  if (hasProductVariants(product)) return true
  if (product.categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    return Boolean(
      attrs.beadSizes?.length ||
        attrs.beadCounts?.length ||
        attrs.wristSizes?.length ||
        getMineralStrandLengths(attrs).length,
    )
  }
  // Strands, bracelets and incense always ask for a size / weight first.
  return (
    product.categorySlug === 'nytky' ||
    product.categorySlug === 'brаslety' ||
    product.categorySlug === 'pahoshchi'
  )
}
