import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { OrdersApi } from '@/api'
import type { OrderPaymentStatus } from '@/types'
import { useAuthStore } from '@/store'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrice } from '@/utils'
import { Button, Loader } from '@/components/ui'
import styles from './CheckoutResultPage.module.scss'

type ViewState = 'loading' | 'awaiting' | 'paid' | 'failed' | 'missing'

export function CheckoutResultPage() {
  const { t, language } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [view, setView] = useState<ViewState>(orderId ? 'loading' : 'missing')
  const [order, setOrder] = useState<OrderPaymentStatus | null>(null)

  useEffect(() => {
    if (!orderId) return

    let cancelled = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const status = await OrdersApi.paymentStatus(orderId)
        if (cancelled) return
        setOrder(status)

        if (status.paymentStatus === 'paid') {
          setView('paid')
          return
        }
        if (status.paymentStatus === 'failed' || status.status === 'cancelled') {
          setView('failed')
          return
        }

        setView('awaiting')
        attempts += 1
        if (attempts < 15) {
          timer = setTimeout(() => {
            void poll()
          }, 2000)
        }
      } catch {
        if (!cancelled) setView('missing')
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [orderId])

  const message =
    view === 'paid'
      ? t('checkout.resultPaid')
      : view === 'failed'
        ? t('checkout.resultFailed')
        : view === 'missing'
          ? t('checkout.resultMissing')
          : t('checkout.resultAwaiting')

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {view === 'loading' || view === 'awaiting' ? (
          <Loader size="lg" />
        ) : view === 'paid' ? (
          <div className={styles.iconSuccess}>
            <Check size={28} strokeWidth={2.5} />
          </div>
        ) : (
          <div className={styles.iconFail}>
            <X size={28} strokeWidth={2.5} />
          </div>
        )}

        <h1 className={styles.title}>{t('checkout.resultTitle')}</h1>
        <p className={styles.text}>{message}</p>
        {order && (
          <p className={styles.meta}>
            #{order.id.slice(0, 8)} · {formatPrice(order.totalPrice, language)}
          </p>
        )}

        <div className={styles.actions}>
          {user ? (
            <>
              <Button as={Link} to="/profile">
                {t('checkout.goToOrders')}
              </Button>
              {view === 'paid' && (
                <Button as={Link} to="/profile#review" variant="secondary">
                  {t('storeReviews.leaveReview')}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button as={Link} to="/catalog">
                {t('cart.continueShopping')}
              </Button>
              {view === 'paid' && (
                <Button as={Link} to="/about#leave-review" variant="secondary">
                  {t('storeReviews.leaveReview')}
                </Button>
              )}
            </>
          )}
          <Button as={Link} to="/" variant="secondary">
            {t('checkout.resultHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
