export interface StrandLengthOption {
  label: string
  value: string
}

export interface MineralAttributes {
  weight?: string
  size?: string
  color?: string
  origin?: string
  hardness?: string
  shape?: string
  /** Bead diameter options in mm, e.g. ['6','8','10'] */
  beadSizes?: string[]
  /** Bead count options, e.g. ['36','40','44'] — legacy, replaced by wristSizes in admin */
  beadCounts?: string[]
  /** Selectable wrist sizes, e.g. ['14 см','15 см'] */
  wristSizes?: string[]
  strandLengths?: StrandLengthOption[]
}

export interface ThreadAttributes {
  color?: string
  /** Display-only default length */
  length?: string
  /** Legacy cord length options in metres — no longer offered to buyers */
  lengths?: string[]
  /** Bead diameter options in mm, e.g. ['6','8','10'] */
  beadSizes?: string[]
  /** Whole / half strand options offered to the buyer */
  strandLengths?: StrandLengthOption[]
  diameter?: string
  material?: string
}

export interface BraceletAttributes {
  /** Display-only size range hint, e.g. '14–21 см' */
  wristSize?: string
  /** Selectable wrist sizes, e.g. ['16 см','17 см','18 см'] */
  wristSizes?: string[]
  /** Bead diameter options in mm, e.g. ['6','8','10'] */
  beadSizes?: string[]
  threadColor?: string
  stones?: string[]
  material?: string
}

/** How an incense product is sold: by weight or as separate pieces. */
export type IncenseSaleMode = 'weight' | 'piece'

export interface IncenseAttributes {
  saleMode?: IncenseSaleMode
  /** Weight portions for `weight` mode, e.g. ['1 кг','100 г','50 г'] */
  packWeights?: string[]
  /** Per-piece weight ranges for `piece` mode, e.g. ['5-6 г','7-8 г'] */
  pieceWeights?: string[]
  scent?: string
  burnTime?: string
  quantity?: string
  material?: string
}

export type ProductAttributes =
  | MineralAttributes
  | ThreadAttributes
  | BraceletAttributes
  | IncenseAttributes

/** Unique stone / option-linked SKU: own photo, price and stock. */
export interface ProductVariant {
  id: string
  name?: string
  image: string
  price?: number
  discountPrice?: number
  stock: number
  /** Buyer option this photo belongs to, e.g. { wristSize: '16 см' } */
  options?: Record<string, string>
  /** Piece-specific specs shown when this photo is selected */
  attributes?: Record<string, string>
}

export interface Product {
  id: string
  subCategoryId: string
  subCategorySlug: string
  categorySlug: string
  categoryName?: string
  subCategoryName?: string
  name: string
  slug: string
  sku: string
  shortDescription: string
  description: string
  price: number
  discountPrice?: number
  stock: number
  images: string[]
  video?: string
  attributes: ProductAttributes
  variants?: ProductVariant[]
  featured: boolean
  popular: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
}
