import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader, Button } from '@/components/ui'
import { useAuthStore, useCartStore, useWishlistStore } from '@/store'
import { AuthApi } from '@/api'
import { setAuthToken } from '@/api/client'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import styles from './AuthCallbackPage.module.scss'

export function AuthCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    if (!token) {
      setErrorKey('auth.errorOauthFailed')
      return
    }

    ;(async () => {
      try {
        setAuthToken(token)
        const user = await AuthApi.me()
        if (!user) {
          setAuthToken(null)
          setErrorKey('auth.errorOauthFailed')
          return
        }

        setSession(token, user)
        await Promise.all([
          useCartStore.getState().mergeGuestCartToServer(),
          useWishlistStore.getState().mergeGuestWishlistToServer(),
        ])
        navigate('/profile', { replace: true })
      } catch {
        setAuthToken(null)
        setErrorKey('auth.errorOauthFailed')
      }
    })()
  }, [navigate, searchParams, setSession])

  if (errorKey) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t('auth.oauthErrorTitle')}</h1>
          <p className={styles.text}>{t(errorKey)}</p>
          <Button as={Link} to="/login">
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Loader size="lg" />
        <p className={styles.text}>{t('auth.oauthProcessing')}</p>
      </div>
    </div>
  )
}
