import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './CatalogButton.module.scss'

type CatalogButtonVariant = 'outline' | 'filled'

interface CatalogButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  variant?: CatalogButtonVariant
}

export const CatalogButton = forwardRef<HTMLButtonElement, CatalogButtonProps>(
  ({ label, variant = 'outline', className, ...props }, ref) => {
    const { t } = useTranslation()

    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={props.disabled ? undefined : { scale: 0.97 }}
        className={[styles.button, styles[variant], className ?? ''].filter(Boolean).join(' ')}
        {...props}
      >
        <LayoutGrid size={20} aria-hidden="true" />
        {label ?? t('catalog.title')}
      </motion.button>
    )
  },
)

CatalogButton.displayName = 'CatalogButton'
