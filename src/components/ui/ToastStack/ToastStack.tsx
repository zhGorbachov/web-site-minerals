import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { useUIStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './ToastStack.module.scss'

const AUTO_DISMISS_MS = 5600

export function ToastStack() {
  const { t } = useTranslation()
  const toasts = useUIStore((s) => s.toasts)
  const dismissToast = useUIStore((s) => s.dismissToast)
  const scheduledRef = useRef(new Set<number>())

  useEffect(() => {
    for (const toast of toasts) {
      if (scheduledRef.current.has(toast.id)) continue
      scheduledRef.current.add(toast.id)
      window.setTimeout(() => {
        scheduledRef.current.delete(toast.id)
        dismissToast(toast.id)
      }, AUTO_DISMISS_MS)
    }
  }, [toasts, dismissToast])

  return (
    <div className={styles.stack} aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const message =
            toast.kind === 'halfStrandsMerged'
              ? t(
                  toast.count === 1
                    ? 'cart.halfStrandsMergedOne'
                    : 'cart.halfStrandsMergedMany',
                  { count: toast.count },
                )
              : ''

          return (
            <motion.div
              key={toast.id}
              className={styles.toast}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <CheckCircle2 className={styles.icon} size={20} aria-hidden />
              <p className={styles.message}>{message}</p>
              <button
                type="button"
                className={styles.close}
                onClick={() => dismissToast(toast.id)}
                aria-label={t('cart.toastDismiss')}
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
