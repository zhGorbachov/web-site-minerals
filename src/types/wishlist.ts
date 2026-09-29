export interface WishlistItem {
  id: string
  productId: string
  /** Same shape as a cart line: includes variantId when a specific photo is saved. */
  selectedOptions?: Record<string, string>
}

export interface Wishlist {
  id: string
  userId: string
  productId: string
}
