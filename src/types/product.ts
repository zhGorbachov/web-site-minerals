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
  beadSizes?: string[]
  strandLengths?: StrandLengthOption[]
}

export interface ThreadAttributes {
  color?: string
  length?: string
  diameter?: string
  material?: string
}

export interface BraceletAttributes {
  wristSize?: string
  threadColor?: string
  stones?: string[]
  material?: string
}

export type ProductAttributes = MineralAttributes | ThreadAttributes | BraceletAttributes

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
  featured: boolean
  popular: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
}
