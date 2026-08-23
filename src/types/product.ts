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
  /** Selectable thread length options, e.g. ['1 м','5 м','10 м'] */
  lengths?: string[]
  diameter?: string
  material?: string
}

export interface BraceletAttributes {
  /** Display-only size range hint, e.g. '14–21 см' */
  wristSize?: string
  /** Selectable wrist sizes, e.g. ['16 см','17 см','18 см'] */
  wristSizes?: string[]
  threadColor?: string
  stones?: string[]
  material?: string
}

export type ProductAttributes = MineralAttributes | ThreadAttributes | BraceletAttributes

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
