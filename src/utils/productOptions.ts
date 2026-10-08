import type {
  BraceletAttributes,
  IncenseAttributes,
  IncenseSaleMode,
  MineralAttributes,
  Product,
  StrandLengthOption,
  ThreadAttributes,
} from '@/types'
import { getVariantOptionValues, hasProductVariants } from './productVariants'
import {
  DEFAULT_BEAD_SIZES,
  DEFAULT_INCENSE_SALE_MODE,
  DEFAULT_PACK_WEIGHTS,
  DEFAULT_PIECE_WEIGHTS,
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
  wristSizeNumber,
} from './catalogDefaults'

export {
  DEFAULT_BEAD_SIZES,
  DEFAULT_INCENSE_SALE_MODE,
  DEFAULT_PACK_WEIGHTS,
  DEFAULT_PIECE_WEIGHTS,
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
  wristSizeNumber,
} from './catalogDefaults'

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

/** Same values the product page offers for this option. */
function listedOptionValues(product: Product, key: string, fallback: string[]): string[] {
  if (product.categorySlug === 'nytky' && key === 'strandLength') return fallback
  const fromVariants = getVariantOptionValues(product, key)
  return fromVariants.length ? fromVariants : fallback
}

/**
 * Choices the buyer must make before the item can go into the cart.
 * Mirrors the option groups rendered on the product page.
 */
export function getRequiredOptionKeys(product: Product): string[] {
  const keys: string[] = []
  const add = (key: string, fallback: string[]) => {
    if (listedOptionValues(product, key, fallback).length) keys.push(key)
  }

  if (product.categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    if (attrs.beadSizes?.length) add('beadSize', attrs.beadSizes)
    if (attrs.wristSizes?.length) add('wristSize', attrs.wristSizes)
    if (attrs.beadCounts?.length) add('beadCount', attrs.beadCounts)
    const strandLengths = getMineralStrandLengths(attrs)
    if (strandLengths.length) add('strandLength', strandLengths.map((length) => length.label))
    return keys
  }

  if (product.categorySlug === 'nytky') {
    const attrs = product.attributes as ThreadAttributes
    add('beadSize', getThreadBeadSizes(attrs))
    add('strandLength', getThreadStrandLengths(attrs).map((length) => length.label))
    return keys
  }

  if (product.categorySlug === 'brаslety') {
    const attrs = product.attributes as BraceletAttributes
    add('beadSize', getBraceletBeadSizes(attrs))
    add('wristSize', getBraceletWristSizes(attrs))
    return keys
  }

  if (product.categorySlug === 'pahoshchi') {
    const attrs = product.attributes as IncenseAttributes
    add(getIncenseOptionKey(attrs), getIncenseWeights(attrs))
  }

  return keys
}

export function getMissingRequiredOptionKeys(
  product: Product,
  selected?: Record<string, string> | null,
): string[] {
  return getRequiredOptionKeys(product).filter((key) => !selected?.[key]?.trim())
}

export function productRequiresOptions(product: Product): boolean {
  if (hasProductVariants(product)) return true
  return getRequiredOptionKeys(product).length > 0
}
