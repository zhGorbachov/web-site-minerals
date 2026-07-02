import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { ArrowRight } from 'lucide-react'
import styles from './CategoryCard.module.scss'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/catalog/${category.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={category.image}
            alt={category.name}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.overlay} />
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{category.name}</h3>
          <p className={styles.description}>{category.description}</p>
          <span className={styles.cta}>
            Переглянути <ArrowRight size={16} />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
