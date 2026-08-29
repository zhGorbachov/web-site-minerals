import type { Product, StrandLengthOption, ThreadAttributes } from '@/types'
import { getThreadStrandLengths } from './productOptions'

export type StrandMergeCartItem = {
  id: string
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

export function isHalfStrandLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase()
  return (
    normalized.includes('пів низк') ||
    normalized.includes('half strand') ||
    /(^|\s)half(\s|$)/.test(normalized) ||
    /(^|\s)пів(\s|$)/.test(normalized)
  )
}

function parseCm(text: string): number | null {
  const match = text.replace(',', '.').match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export function findWholeStrandLabel(
  strandLengths: StrandLengthOption[],
  halfLabel: string,
): string | null {
  if (!strandLengths.length || !isHalfStrandLabel(halfLabel)) return null

  const halfOption =
    strandLengths.find((entry) => entry.label === halfLabel) ??
    strandLengths.find((entry) => isHalfStrandLabel(entry.label))

  if (!halfOption) return null

  const halfCm = parseCm(halfOption.value) ?? parseCm(halfOption.label)
  if (halfCm != null) {
    const target = halfCm * 2
    const byLength = strandLengths.find((entry) => {
      if (isHalfStrandLabel(entry.label)) return false
      const cm = parseCm(entry.value) ?? parseCm(entry.label)
      return cm != null && Math.abs(cm - target) < 0.05
    })
    if (byLength) return byLength.label
  }

  return strandLengths.find((entry) => !isHalfStrandLabel(entry.label))?.label ?? null
}

function getStrandLengths(product: Product): StrandLengthOption[] {
  if (product.categorySlug !== 'nytky') return []
  return getThreadStrandLengths(product.attributes as ThreadAttributes)
}

function restOptionsKey(options?: Record<string, string>): string {
  const rest = { ...(options ?? {}) }
  delete rest.strandLength
  return JSON.stringify(rest)
}

/**
 * Converts pairs of identical half-strands into whole strands.
 * Keeps bead size / count and other options; leaves an odd half if needed.
 */
export function mergeHalfStrands(items: StrandMergeCartItem[]): {
  items: StrandMergeCartItem[]
  mergedPairs: number
} {
  let mergedPairs = 0
  const byProduct = new Map<string, StrandMergeCartItem[]>()

  for (const item of items) {
    const list = byProduct.get(item.product.id) ?? []
    list.push({
      ...item,
      selectedOptions: item.selectedOptions ? { ...item.selectedOptions } : undefined,
    })
    byProduct.set(item.product.id, list)
  }

  const output: StrandMergeCartItem[] = []

  for (const productItems of byProduct.values()) {
    const product = productItems[0].product
    const strandLengths = getStrandLengths(product)

    if (!strandLengths.length) {
      output.push(...productItems)
      continue
    }

    const groups = new Map<string, StrandMergeCartItem[]>()
    for (const item of productItems) {
      const key = restOptionsKey(item.selectedOptions)
      const list = groups.get(key) ?? []
      list.push(item)
      groups.set(key, list)
    }

    for (const group of groups.values()) {
      const halves: StrandMergeCartItem[] = []
      const others: StrandMergeCartItem[] = []

      for (const item of group) {
        const label = item.selectedOptions?.strandLength
        if (label && isHalfStrandLabel(label)) halves.push(item)
        else others.push(item)
      }

      if (!halves.length) {
        output.push(...group)
        continue
      }

      const wholeLabel = findWholeStrandLabel(
        strandLengths,
        halves[0].selectedOptions!.strandLength,
      )
      if (!wholeLabel) {
        output.push(...group)
        continue
      }

      const halfQty = halves.reduce((sum, item) => sum + item.quantity, 0)
      const pairs = Math.floor(halfQty / 2)
      const remainder = halfQty % 2

      if (pairs <= 0) {
        output.push(...group)
        continue
      }

      mergedPairs += pairs

      const wholeItems = others.filter(
        (item) => item.selectedOptions?.strandLength === wholeLabel,
      )
      const nonWholeOthers = others.filter(
        (item) => item.selectedOptions?.strandLength !== wholeLabel,
      )

      output.push(...nonWholeOthers)

      const existingWholeQty = wholeItems.reduce((sum, item) => sum + item.quantity, 0)
      const wholeQty = Math.min(existingWholeQty + pairs, product.stock)
      const wholeOptions = {
        ...(halves[0].selectedOptions ?? {}),
        strandLength: wholeLabel,
      }

      if (wholeQty > 0) {
        output.push({
          id: wholeItems[0]?.id ?? `strand-${product.id}-${Date.now()}`,
          product,
          quantity: wholeQty,
          selectedOptions: wholeOptions,
        })
      }

      if (remainder > 0) {
        output.push({
          id: halves[0].id,
          product,
          quantity: remainder,
          selectedOptions: { ...(halves[0].selectedOptions ?? {}) },
        })
      }
    }
  }

  return { items: output, mergedPairs }
}
