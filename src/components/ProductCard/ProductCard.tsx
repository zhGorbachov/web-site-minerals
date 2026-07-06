import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatPrice } from '@/utils'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.discountPrice ?? product.price
  const productUrl = `/product/${product.slug}`

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={productUrl} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
          {product.isNew && (
            <span className={styles.badgeNew}>Новинка</span>
          )}
          {product.discountPrice && (
            <span className={styles.badgeSale}>
              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </span>
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.name}>{product.name}</h3>

          <div className={styles.footer}>
            <div className={styles.priceGroup}>
              <span className={styles.price}>{formatPrice(displayPrice)}</span>
              {product.discountPrice && (
                <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
