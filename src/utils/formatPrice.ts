export function formatPrice(price: number): string {
  return `${price} грн`
}

export function formatPriceRange(min: number, max: number): string {
  return `${min}–${max} грн`
}
