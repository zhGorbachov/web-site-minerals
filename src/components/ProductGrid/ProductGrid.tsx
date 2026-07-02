import type { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui'
import styles from './ProductGrid.module.scss'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}

export function ProductGrid({ products, loading = false, skeletonCount = 8 }: ProductGridProps) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
