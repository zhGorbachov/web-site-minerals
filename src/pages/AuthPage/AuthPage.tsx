import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import { useAuthStore, type AuthError } from '@/store'
import { useCartStore, useWishlistStore } from '@/store'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { Button, Input, Breadcrumbs } from '@/components/ui'
import { AuthApi } from '@/api'
import styles from './AuthPage.module.scss'

type AuthMode = 'login' | 'register'

const ERROR_KEYS: Record<AuthError, TranslationKey> = {
  email_taken: 'auth.errorEmailTaken',
  invalid_credentials: 'auth.errorInvalidCredentials',
  weak_password: 'auth.errorWeakPassword',
  required: 'auth.errorRequired',
  invalid_email: 'auth.errorInvalidEmail',
  name_required: 'auth.errorNameRequired',
  oauth_not_configured: 'auth.errorOauthNotConfigured',
  oauth_denied: 'auth.errorOauthDenied',
  oauth_failed: 'auth.errorOauthFailed',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
      <path d="M14.79 12.35c-.25.58-.37.84-.69 1.35-.45.72-.1.1-.1.1s-.55.37-.95.66c-.35.25-.7.5-1.22.5-.48 0-.95-.28-1.45-.56-.48-.28-.97-.56-1.52-.56-.58 0-1.08.29-1.57.58-.46.27-.89.53-1.32.53-.48 0-.88-.28-1.28-.62-.5-.43-.98-.1.1-.1.1 0-1.55-3.55-.65-5.42.45-.93 1.24-1.47 1.95-1.47.48 0 .98.3 1.45.56.45.26.9.52 1.42.52.5 0 .95-.27 1.42-.54.5-.29 1.03-.59 1.6-.59.66 0 1.38.4 1.86 1.09-1.64.9-1.37 3.24.15 3.97ZM12.1 2.9c.28-.35.5-.84.42-1.34-.42.03-.93.3-1.23.65-.27.31-.5.8-.41 1.27.45.03.93-.23 1.22-.58Z" />
    </svg>
  )
}

async function syncUserData() {
  await Promise.all([
    useCartStore.getState().mergeGuestCartToServer(),
    useWishlistStore.getState().mergeGuestWishlistToServer(),
  ])
}

export function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  const modeParam = searchParams.get('mode')
  const mode: AuthMode = modeParam === 'register' ? 'register' : 'login'
  const oauthError = searchParams.get('error') as AuthError | null

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<AuthError | null>(oauthError)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/profile', { replace: true })
  }, [user, navigate])

  const setMode = (next: AuthMode) => {
    setError(null)
    setSearchParams(next === 'register' ? { mode: 'register' } : {}, { replace: true })
  }

  const handleGoogle = () => {
    window.location.assign(AuthApi.googleStartUrl())
  }

  const handleApple = () => {
    window.location.assign(AuthApi.appleStartUrl())
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result =
      mode === 'login'
        ? await login(email, password)
        : await register({ firstName, lastName, email, phone, password })

    setLoading(false)
    if (result) {
      setError(result)
      return
    }

    await syncUserData()
    navigate('/profile', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('about.breadcrumbHome'), href: '/' },
            { label: mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle') },
          ]}
        />

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={styles.tabs} role="tablist" aria-label={t('auth.tabsAria')}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={[styles.tab, mode === 'login' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('login')}
            >
              {t('auth.loginTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={[styles.tab, mode === 'register' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('register')}
            >
              {t('auth.registerTab')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className={styles.title}>
                {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
              </h1>
              <p className={styles.subtitle}>
                {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
              </p>

              <div className={styles.socialBlock}>
                <button type="button" className={styles.socialBtn} onClick={handleGoogle}>
                  <GoogleIcon />
                  <span>{t('auth.continueGoogle')}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.socialBtnApple}`}
                  onClick={handleApple}
                >
                  <AppleIcon />
                  <span>{t('auth.continueApple')}</span>
                </button>
              </div>

              <div className={styles.divider} role="separator">
                <span>{t('auth.orEmail')}</span>
              </div>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {mode === 'register' && (
                  <div className={styles.nameRow}>
                    <Input
                      label={t('auth.firstName')}
                      name="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      leftIcon={<User />}
                      required
                    />
                    <Input
                      label={t('auth.lastName')}
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      leftIcon={<User />}
                      required
                    />
                  </div>
                )}

                <Input
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail />}
                  required
                />

                {mode === 'register' && (
                  <Input
                    label={t('auth.phone')}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone />}
                    placeholder={t('auth.phoneOptional')}
                  />
                )}

                <Input
                  label={t('auth.password')}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock />}
                  rightIcon={
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  required
                />

                {error && (
                  <p className={styles.error} role="alert">
                    {t(ERROR_KEYS[error] ?? 'auth.errorOauthFailed')}
                  </p>
                )}

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  {mode === 'login' ? t('auth.loginSubmit') : t('auth.registerSubmit')}
                </Button>
              </form>

              <p className={styles.switchHint}>
                {mode === 'login' ? (
                  <>
                    {t('auth.noAccount')}{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setMode('register')}>
                      {t('auth.registerTab')}
                    </button>
                  </>
                ) : (
                  <>
                    {t('auth.hasAccount')}{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setMode('login')}>
                      {t('auth.loginTab')}
                    </button>
                  </>
                )}
              </p>

              <p className={styles.backHome}>
                <Link to="/">{t('auth.backHome')}</Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
