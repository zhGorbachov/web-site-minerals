import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpDown, Check } from 'lucide-react'
import { PRODUCT_SORT_OPTIONS, type ProductSortOption } from '@/utils/sortProducts'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import styles from './ProductSort.module.scss'

const SORT_LABEL_KEYS: Record<ProductSortOption, TranslationKey> = {
  default: 'sort.default',
  'name-asc': 'sort.nameAsc',
  'name-desc': 'sort.nameDesc',
  'price-asc': 'sort.priceAsc',
  'price-desc': 'sort.priceDesc',
  newest: 'sort.newest',
  popular: 'sort.popular',
}

interface ProductSortProps {
  value: ProductSortOption
  onChange: (value: ProductSortOption) => void
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const activeLabel = t(SORT_LABEL_KEYS[value])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (option: ProductSortOption) => {
    onChange(option)
    setOpen(false)
  }

  return (
    <div className={styles.wrap} ref={menuRef}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.triggerActive : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen((current) => !current)}
        aria-label={t('sort.aria')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ArrowUpDown size={18} aria-hidden="true" />
        <span className={styles.triggerLabel}>{activeLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className={styles.menu}
            role="listbox"
            aria-label={t('sort.listAria')}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {PRODUCT_SORT_OPTIONS.map((option) => {
              const isActive = option === value

              return (
                <li key={option} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    className={[styles.option, isActive ? styles.optionActive : ''].filter(Boolean).join(' ')}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{t(SORT_LABEL_KEYS[option])}</span>
                    {isActive && <Check size={14} aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
