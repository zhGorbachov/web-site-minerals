import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { SubCategory } from '@/types'
import styles from './SubcategoryCard.module.scss'

interface SubcategoryCardProps {
  subcategory: SubCategory
  categorySlug: string
}

export function SubcategoryCard({ subcategory, categorySlug }: SubcategoryCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/catalog/${categorySlug}/${subcategory.slug}`}
        className={styles.link}
      >
        <img
          src={subcategory.image}
          alt={subcategory.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
        <span className={styles.label}>{subcategory.name}</span>
      </Link>
    </motion.div>
  )
}
