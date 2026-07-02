import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { useOpenCatalog } from '@/hooks/useOpenCatalog'
import { Button } from '@/components/ui'
import styles from './NotFoundPage.module.scss'

export function NotFoundPage() {
  const openCatalog = useOpenCatalog()
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.gem} aria-hidden="true">◆</div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Сторінку не знайдено</h2>
        <p className={styles.text}>
          На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <div className={styles.actions}>
          <Button as={Link} to="/" leftIcon={<Home size={18} />}>
            На головну
          </Button>
          <Button variant="outline" leftIcon={<ArrowLeft size={18} />} onClick={openCatalog}>
            До каталогу
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
